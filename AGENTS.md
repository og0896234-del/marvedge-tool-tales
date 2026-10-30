<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Each tool is one page at `/$slug` (data in `src/lib/tools.ts`, working UI in `src/components/tools/`, chosen by `registry.tsx`) — keeps 18 tools on one template.
- File tools run fully in the browser (canvas, pdf-lib, gifenc, MediaRecorder) — no uploads, no server cost.
- AI tools call Lovable AI through server functions in `src/lib/ai.functions.ts`; gateway calls live in `ai.server.ts` — keeps the key server-side.
