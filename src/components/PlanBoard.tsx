import { PLOT_STAGES, PEEL_STAGES } from "@/lib/content";

const TONE: Record<string, string> = { sky: "border-sky bg-sky-soft", mint: "border-mint bg-mint-soft", sun: "border-sun bg-sun-soft", grape: "border-grape bg-grape-soft" };

export function PlanBoard({ mode, value, onChange }: { mode: "narrative" | "peel"; value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const stages = mode === "narrative" ? PLOT_STAGES : PEEL_STAGES;
  return (
    <div className={`grid gap-3 ${mode === "narrative" ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
      {stages.map((st, i) => (
        <div key={st.key} className={`${TONE[st.color]} flex flex-col rounded-2xl border-t-4 p-3`}>
          <div className="font-display text-lg">{i + 1}. {st.label}</div>
          <ul className="my-2 space-y-1 text-xs text-muted-foreground">
            {st.qs.map((q) => <li key={q}>• {q}</li>)}
          </ul>
          <textarea className="field mt-auto min-h-32 text-sm" placeholder="写下你的想法……" value={value[st.key] ?? ""} onChange={(e) => onChange({ ...value, [st.key]: e.target.value })} />
        </div>
      ))}
    </div>
  );
}

export function planFilled(mode: "narrative" | "peel", v: Record<string, string>) {
  const stages = mode === "narrative" ? PLOT_STAGES : PEEL_STAGES;
  return stages.filter((s) => (v[s.key] ?? "").trim().length >= 6).length / stages.length;
}
