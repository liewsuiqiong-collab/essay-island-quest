import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Feedback, PageHead, Progress } from "@/components/kit";
import { AUDIT_CASES, type AuditCase } from "@/lib/content";
import { award, giveBadge, recordWrong } from "@/lib/store";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "审题侦探 · 作文冒险岛" },
      { name: "description", content: "找出题目关键词、人物、事件与写作要求，练习判断切题、偏题与离题。" },
      { property: "og:title", content: "审题侦探 · 作文冒险岛" },
      { property: "og:description", content: "先看提示再找答案，练好审题第一步。" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [caseId, setCaseId] = useState(AUDIT_CASES[0].id);
  const c = AUDIT_CASES.find((x) => x.id === caseId)!;
  return (
    <div>
      <PageHead icon="🔍" title="审题侦探" desc="像侦探一样拆解题目：关键词、人物、事件、要求，再判断构思是否切题。" />
      <div className="mb-4 flex flex-wrap gap-2">
        {AUDIT_CASES.map((x, i) => (
          <button key={x.id} onClick={() => setCaseId(x.id)} className={`chip ${x.id === caseId ? "border-primary bg-sky-soft font-semibold text-primary" : ""}`}>案件 {i + 1}：{x.id === "a-embarrass" ? "记叙文" : "观点题"}</button>
        ))}
      </div>
      <CaseRunner key={c.id} c={c} />
    </div>
  );
}

function CaseRunner({ c }: { c: AuditCase }) {
  const total = c.steps.length + c.judges.length;
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const next = (firstTry: boolean) => {
    if (firstTry) setScore((s) => s + 1);
    if (idx + 1 >= total) {
      setFinished(true);
      award(`audit-${c.id}`, 40, `审题侦探：完成「${c.id === "a-embarrass" ? "比赛尴尬事" : "表达爱"}」案件`, "审题");
      giveBadge("audit");
    } else setIdx(idx + 1);
  };

  return (
    <div className="card p-5 sm:p-6">
      <div className="rounded-xl bg-muted p-4 text-[15px] leading-relaxed">📜 <strong>题目：</strong>{c.title}</div>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <span className="shrink-0 text-muted-foreground">进度 {Math.min(idx + (finished ? 1 : 0), total)}/{total}</span>
        <Progress value={((idx + (finished ? 1 : 0)) / total) * 100} />
      </div>
      {finished ? (
        <div className="py-8 text-center">
          <div className="text-5xl">🕵️</div>
          <h3 className="mt-3 text-2xl">案件破解！</h3>
          <p className="mt-2 text-muted-foreground">一次答对 {score}/{total} 题。首次完成可获得 40 XP 与「审题侦探」徽章。</p>
          <button className="btn btn-primary mt-4" onClick={() => { setIdx(0); setScore(0); setFinished(false); }}>再挑战一次</button>
        </div>
      ) : idx < c.steps.length ? (
        <StepQ key={idx} step={c.steps[idx]} id={`${c.id}-s${idx}`} onDone={next} />
      ) : (
        <JudgeQ key={idx} item={c.judges[idx - c.steps.length]} id={`${c.id}-j${idx}`} n={idx - c.steps.length + 1} onDone={next} />
      )}
    </div>
  );
}

function StepQ({ step, id, onDone }: { step: AuditCase["steps"][number]; id: string; onDone: (first: boolean) => void }) {
  const [sel, setSel] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [state, setState] = useState<"idle" | "wrong" | "ok">("idle");
  const [reveal, setReveal] = useState(false);

  const toggle = (i: number) => {
    if (state === "ok") return;
    setState("idle");
    setSel(step.multi ? (sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i]) : [i]);
  };
  const check = () => {
    const correct = step.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i >= 0);
    const ok = correct.length === sel.length && correct.every((i) => sel.includes(i));
    setTries(tries + 1);
    if (ok) setState("ok");
    else { setState("wrong"); recordWrong("auditWrong", id); }
  };

  return (
    <div className="mt-5">
      <h3 className="text-lg">{step.q}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {step.options.map((o, i) => {
          const on = sel.includes(i);
          const show = state === "ok" || reveal;
          return (
            <button key={i} onClick={() => toggle(i)} className={`chip text-[15px] ${on ? "border-primary bg-sky-soft" : ""} ${show && o.correct ? "border-success bg-mint-soft" : ""}`}>{o.text}</button>
          );
        })}
      </div>
      {state === "wrong" && (
        <Feedback kind="hint">
          还不完全对{step.multi ? "（可能漏选或多选了）" : ""}。提示：{step.hint}
          {tries >= 2 && !reveal && <button className="ml-2 underline" onClick={() => setReveal(true)}>查看答案解释</button>}
        </Feedback>
      )}
      {(state === "ok" || reveal) && <Feedback kind={state === "ok" ? "ok" : "info"}>{state === "ok" ? "答对了！" : "答案已标示为绿色。"}{step.explain}</Feedback>}
      <div className="mt-4 flex gap-2">
        {state !== "ok" && !reveal ? (
          <button className="btn btn-primary" disabled={!sel.length} onClick={check}>检查答案</button>
        ) : (
          <button className="btn btn-sun" onClick={() => onDone(tries === 1 && state === "ok")}>下一题 →</button>
        )}
      </div>
    </div>
  );
}

function JudgeQ({ item, id, n, onDone }: { item: AuditCase["judges"][number]; id: string; n: number; onDone: (first: boolean) => void }) {
  const [pick, setPick] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [reveal, setReveal] = useState(false);
  const ok = pick === item.answer;
  const choose = (a: string) => {
    if (ok || reveal) return;
    setPick(a);
    setTries(tries + 1);
    if (a !== item.answer) recordWrong("auditWrong", id);
  };
  return (
    <div className="mt-5">
      <h3 className="text-lg">切题判断 {n}：这份构思是切题、偏题还是离题？</h3>
      <blockquote className="mt-3 rounded-xl border-l-4 border-grape bg-grape-soft p-4 text-[15px] leading-relaxed">{item.outline}</blockquote>
      <div className="mt-3 flex gap-2">
        {(["切题", "偏题", "离题"] as const).map((a) => (
          <button key={a} onClick={() => choose(a)} className={`btn flex-1 ${pick === a ? (ok ? "btn-mint" : "btn-sun") : "btn-ghost"} ${reveal && a === item.answer ? "btn-mint" : ""}`}>{a}</button>
        ))}
      </div>
      {pick && !ok && !reveal && (
        <Feedback kind="hint">
          再想想。提示：{item.hint}
          {tries >= 2 && <button className="ml-2 underline" onClick={() => setReveal(true)}>查看答案解释</button>}
        </Feedback>
      )}
      {(ok || reveal) && <Feedback kind={ok ? "ok" : "info"}>答案：{item.answer}。{item.explain}</Feedback>}
      {(ok || reveal) && <button className="btn btn-sun mt-4" onClick={() => onDone(ok && tries === 1)}>下一题 →</button>}
    </div>
  );
}
