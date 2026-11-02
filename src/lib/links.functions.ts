import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

async function hashPassword(pw: string, saltHex?: string) {
  const salt = saltHex ? new Uint8Array(saltHex.match(/../g)!.map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  return `${hex(salt.buffer as ArrayBuffer)}:${hex(bits)}`;
}

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

export const createShortLink = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      url: z.string().url().max(2000).refine((u) => /^https?:\/\//i.test(u), "Use an http(s) link"),
      code: z.string().regex(/^[A-Za-z0-9_-]{3,40}$/, "3–40 letters, numbers, - or _").optional(),
      password: z.string().min(4).max(100).optional(),
      expiresAt: z.string().datetime().optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const code = data.code ?? Math.random().toString(36).slice(2, 9);
    const { error } = await db.from("short_links").insert({
      code,
      url: data.url,
      password_hash: data.password ? await hashPassword(data.password) : null,
      expires_at: data.expiresAt ?? null,
    });
    if (error) return { ok: false as const, error: error.code === "23505" ? "That custom link is already taken." : "Could not create the link." };
    return { ok: true as const, code };
  });

type Resolve = { status: "ok"; url: string } | { status: "password" } | { status: "expired" } | { status: "missing" } | { status: "wrong" };

export const resolveShortLink = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().max(40), password: z.string().max(100).optional() }).parse(d))
  .handler(async ({ data }): Promise<Resolve> => {
    const db = await admin();
    const { data: row } = await db.from("short_links").select("*").eq("code", data.code).maybeSingle();
    if (!row) return { status: "missing" };
    if (row.expires_at && new Date(row.expires_at) < new Date()) return { status: "expired" };
    if (row.password_hash) {
      if (!data.password) return { status: "password" };
      const [salt] = row.password_hash.split(":");
      if ((await hashPassword(data.password, salt)) !== row.password_hash) return { status: "wrong" };
    }
    await db.from("short_links").update({ clicks: row.clicks + 1 }).eq("code", data.code);
    return { status: "ok", url: row.url };
  });
