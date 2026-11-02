import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { resolveShortLink } from "@/lib/links.functions";

export const Route = createFileRoute("/go/$code")({
  loader: async ({ params }) => {
    const r = await resolveShortLink({ data: { code: params.code } });
    if (r.status === "ok" && typeof window !== "undefined") window.location.replace(r.url);
    return r;
  },
  head: () => ({
    meta: [
      { title: "Opening your link | Marvedge Link Shortener" },
      { name: "description", content: "A short link created with the free Marvedge Link Shortener." },
      { property: "og:title", content: "Opening your link | Marvedge" },
      { property: "og:description", content: "A short link created with the free Marvedge Link Shortener." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Go,
});

function Go() {
  const first = Route.useLoaderData();
  const { code } = Route.useParams();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (first.status === "ok") {
    return <Shell title="Taking you there…"><a className="btn-primary" href={first.url}>Continue</a></Shell>;
  }
  if (first.status === "password") {
    const unlock = async (e: React.FormEvent) => {
      e.preventDefault(); setBusy(true); setMsg(null);
      const r = await resolveShortLink({ data: { code, password: pw } });
      setBusy(false);
      if (r.status === "ok") window.location.replace(r.url);
      else setMsg(r.status === "wrong" ? "Wrong password, try again." : "This link is no longer available.");
    };
    return (
      <Shell title="This link is password protected">
        <form onSubmit={unlock} className="flex w-full max-w-sm flex-col gap-3">
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password"
            className="rounded-xl border bg-background px-3 py-2.5 outline-none focus:border-primary" />
          <button className="btn-primary justify-center" disabled={busy || !pw}><Lock className="h-4 w-4" /> {busy ? "Checking…" : "Unlock"}</button>
          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </form>
      </Shell>
    );
  }
  return (
    <Shell title={first.status === "expired" ? "This link has expired" : "Link not found"}>
      <Link to="/$slug" params={{ slug: "link-shortener" }} className="btn-primary">Make your own short link</Link>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-hero flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 py-20 text-center">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {children}
    </div>
  );
}
