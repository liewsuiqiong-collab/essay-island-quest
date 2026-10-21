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

## Project rules
- All persistence goes through `src/lib/store.ts` (localStorage for phase 1); swap its implementation for the cloud backend later so pages stay unchanged.
- Fixed exercise content lives in `src/lib/content.ts`; feedback is rule-based in `src/lib/feedback.ts` — never present it as AI grading.
- XP is awarded via `award(key, …)` with a unique key so each exercise counts once (no farming, no public leaderboard).
- No teacher backend, login, or server code: the app is a pure static SPA (`spa: { enabled: true }` in vite.config.ts) so it can be exported and hosted on GitHub Pages; keep it free of server functions and external service calls.
- Station scoring (5 islands, 20 points each, 100 total) lives in `src/lib/scores.ts`; per-station best scores and museum task results persist via store.ts. Scores must stay rule-based and explainable — never grade open-ended writing quality.
- The homepage adventure scene uses separate imported artwork and interactive island components; existing exercise routes stay intact so presentation changes do not replace learning logic.
- Prebundle shared UI dependencies in Vite's optimizeDeps while preserving the template's React deduplication; late dependency discovery can mix React module generations during preview updates.
