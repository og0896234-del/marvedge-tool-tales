import { createFileRoute, notFound } from "@tanstack/react-router";
import { tools } from "@/lib/tools";
import { ToolPage } from "@/components/ToolPage";

export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    const tool = tools.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.tool;
    const title = t ? `${t.name} — free online tool | Marvedge` : "Tool not found | Marvedge";
    const desc = t ? `${t.tagline} ${t.sub}` : "This tool could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(t ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: Page,
});

function Page() {
  const { tool } = Route.useLoaderData();
  return <ToolPage key={tool.slug} tool={tool} />;
}
