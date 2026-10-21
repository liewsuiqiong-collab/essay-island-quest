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
- Teacher UI lives under `/teacher` with its own header; keep it separate from student pages.
- The homepage adventure scene uses separate imported artwork and interactive island components; existing exercise routes stay intact so presentation changes do not replace learning logic.
- Prebundle shared UI dependencies in Vite's optimizeDeps while preserving the template's React deduplication; late dependency discovery can mix React module generations during preview updates.
