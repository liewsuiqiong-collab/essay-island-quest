import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Feedback, LocalNotice, PageHead } from "@/components/kit";
import { CHALLENGE_PROMPTS, MODEL_ESSAYS, MUSEUM_TASKS } from "@/lib/content";
import { countChars, setMuseumResult, setStationScore, useStore } from "@/lib/store";

export const Route = createFileRoute("/museum")({
  head: () => ({
    meta: [
      { title: "范文学习馆 · 作文闯关岛" },
      { name: "description", content: "先写自己的作文，再解锁范文：结构侦探、表达升级、写作迁移三组任务。" },
      { property: "og:title", content: "范文学习馆 · 作文闯关岛" },
      { property: "og:description", content: "读范文、学方法，不照抄。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MuseumPage,
});

function MuseumPage() {
  const s = useStore();
  const [pid, setPid] = useState(() => {
    const done = CHALLENGE_PROMPTS.find((p) => s.essays.some((e) => e.promptId === p.id && e.status !== "构思中"));
    return (done ?? CHALLENGE_PROMPTS[0]!).id;
  });
  const prompt = CHALLENGE_PROMPTS.find((p) => p.id === pid)!;
  const task = MUSEUM_TASKS[pid]!;
  const unlocked = s.essays.some((e) => e.promptId === pid && e.status !== "构思中");
  const saved = s.museumResults[pid];
  const [redo, setRedo] = useState(false);

  return (
    <div>
      <PageHead icon="📚" title="范文学习馆" desc="先写自己的作文，再读范文、学方法：结构侦探 → 表达升级 → 写作迁移。满分 20 分。" tone="grape" />
      <div className="mb-4 flex flex-wrap gap-2">
        {CHALLENGE_PROMPTS.map((p) => (
          <button key={p.id} onClick={() => { setPid(p.id); setRedo(false); }} className={`chip ${p.id === pid ? "border-grape bg-grape-soft font-semibold" : ""}`}>
            {p.label} {s.essays.some((e) => e.promptId === p.id && e.status !== "构思中") ? "🔓" : "🔒"}
          </button>
        ))}
      </div>
      <div className="card mb-4 rounded-xl bg-muted p-4 text-[15px] leading-relaxed">📜 <strong>{prompt.label}：</strong>{prompt.title}</div>

      {!unlocked ? (
        <div className="card p-8 text-center">
          <div className="text-5xl">🔒</div>
          <h3 className="mt-3 text-2xl">先写自己的作文，才能解锁范文</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            请先到「作文终极挑战」选择{prompt.label ? ` ${prompt.label} ` : "这道"}题，完成初稿并通过自我检查。这样做是先形成自己的想法，再借鉴别人的写法，而不是照抄。
          </p>
          <Link to="/challenge" className="btn btn-primary mt-4 inline-block">去写作文 ✍️</Link>
        </div>
      ) : saved && !redo ? (
        <div className="card p-6">
          <h3 className="text-xl">🎓 本题学习任务已完成</h3>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-sky-soft p-3">A. 结构侦探：<strong>{saved.a}/8 分</strong></div>
            <div className="rounded-xl bg-mint-soft p-3">B. 表达升级：<strong>{saved.b}/6 分</strong></div>
            <div className="rounded-xl bg-sun-soft p-3">C. 写作迁移：<strong>{saved.c}/6 分</strong></div>
          </div>
          <p className="mt-3">本题总分：<strong className="text-lg">{saved.total}/20</strong>（学习馆取各题最高分）</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={() => setRedo(true)}>重新挑战</button>
            <Link to="/report" className="btn btn-primary">查看学习报告 →</Link>
          </div>
          <details className="mt-4 rounded-xl border bg-muted/40">
            <summary className="cursor-pointer select-none px-4 py-3 font-medium">再读一读范文</summary>
            <div className="px-4 pb-4"><EssayCards promptId={pid} /></div>
          </details>
        </div>
      ) : (
        <TaskRunner key={pid} promptId={pid} cText={saved?.cText ?? ""} />
      )}
      <div className="mt-4"><LocalNotice /></div>
    </div>
  );
}

function EssayCards({ promptId }: { promptId: string }) {
  const essays = MODEL_ESSAYS[promptId] ?? [];
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">范文只供学习参考：学别人的写法，用到自己的文章里，<strong>请不要照抄</strong>。</p>
      {essays.map((m, i) => (
        <details key={m.author} className="rounded-xl border bg-muted/40" open={i === 0}>
          <summary className="cursor-pointer select-none px-4 py-3 font-medium">范文{i + 1}（{m.author}）<span className="ml-2 rounded-full bg-grape-soft px-2 py-0.5 text-xs font-normal">{m.kind}</span></summary>
          <div className="whitespace-pre-wrap px-4 pb-4 leading-relaxed">{m.text}</div>
        </details>
      ))}
    </div>
  );
}

function TaskRunner({ promptId, cText: savedCText }: { promptId: string; cText: string }) {
  const task = MUSEUM_TASKS[promptId]!;
  const [aSel, setASel] = useState<(number | null)[]>(task.structure.map(() => null));
  const [bPick, setBPick] = useState<number | null>(null);
  const [cPick, setCPick] = useState<number | null>(null);
  const [cText, setCText] = useState(savedCText);
  const [result, setResult] = useState<{ a: number; b: number; c: number; total: number } | null>(null);

  const aReady = aSel.every((x) => x !== null);
  const submit = () => {
    const a = task.structure.reduce((n, it, i) => n + (aSel[i] === it.answer ? 2 : 0), 0);
    const b = bPick === task.expression.answer ? 6 : 0;
    const c = (cPick === task.transfer.answer ? 4 : 0) + (countChars(cText) >= 5 ? 2 : 0);
    const total = a + b + c;
    const r = { a, b, c, cText, total };
    setMuseumResult(promptId, r);
    setStationScore("museum", total);
    setResult(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      {result && (
        <Feedback kind={result.total >= 14 ? "ok" : "info"}>
          <strong>本次得分：{result.total}/20</strong>（结构侦探 {result.a}/8 · 表达升级 {result.b}/6 · 写作迁移 {result.c}/6）。
          学习馆取你各题的最高分。可以改正答案后再提交一次，或前往下一站「作文终极挑战」。
        </Feedback>
      )}
      <section className="card p-5">
        <h3 className="text-lg">第一步：读范文</h3>
        <div className="mt-3"><EssayCards promptId={promptId} /></div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg">任务 A：结构侦探（8 分，配对一题 2 分）</h3>
        <p className="mt-1 text-sm text-muted-foreground">下面的四个节选分别属于文章的哪个部分？为每一段选出正确的结构。</p>
        <div className="mt-3 space-y-3">
          {task.structure.map((it, i) => (
            <div key={i} className="rounded-xl border p-3">
              <p className="text-sm leading-relaxed">“{it.excerpt}”</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  className="field max-w-56"
                  value={aSel[i] ?? ""}
                  disabled={result !== null}
                  onChange={(e) => setASel(aSel.map((x, j) => (j === i ? (e.target.value === "" ? null : Number(e.target.value)) : x)))}
                >
                  <option value="">选择结构部分…</option>
                  {task.structureLabels.map((l, k) => <option key={l} value={k}>{l}</option>)}
                </select>
                {result && (
                  <span className={`text-sm ${aSel[i] === it.answer ? "text-success" : "text-destructive"}`}>
                    {aSel[i] === it.answer ? "✓ 正确" : `✗ 正确答案：${task.structureLabels[it.answer]}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg">任务 B：表达升级（6 分）</h3>
        <p className="mt-1 text-sm">{task.expression.q}</p>
        <div className="mt-3 grid gap-2">
          {task.expression.options.map((o, k) => (
            <button key={k} disabled={result !== null} onClick={() => setBPick(k)}
              className={`rounded-xl border-2 p-3 text-left text-sm transition hover:bg-muted ${bPick === k ? "border-grape bg-grape-soft" : ""} ${result && k === task.expression.answer ? "border-success bg-mint-soft" : ""}`}>{o}</button>
          ))}
        </div>
        {result && <Feedback kind={bPick === task.expression.answer ? "ok" : "hint"}>{bPick === task.expression.answer ? "答对了！" : "再读读正确答案。"}{task.expression.explain}</Feedback>}
      </section>

      <section className="card p-5">
        <h3 className="text-lg">任务 C：写作迁移（6 分）</h3>
        <p className="mt-1 text-sm">{task.transfer.q}（4 分）</p>
        <div className="mt-3 grid gap-2">
          {task.transfer.options.map((o, k) => (
            <button key={k} disabled={result !== null} onClick={() => setCPick(k)}
              className={`rounded-xl border-2 p-3 text-left text-sm transition hover:bg-muted ${cPick === k ? "border-grape bg-grape-soft" : ""} ${result && k === task.transfer.answer ? "border-success bg-mint-soft" : ""}`}>{o}</button>
          ))}
        </div>
        {result && <Feedback kind={cPick === task.transfer.answer ? "ok" : "hint"}>{task.transfer.explain}</Feedback>}
        <label className="mt-4 block text-sm">{task.transfer.fillPrompt}（写满 5 个字得 2 分）
          <textarea className="field mt-1 min-h-20" value={cText} disabled={result !== null} onChange={(e) => setCText(e.target.value)} placeholder="例如：我想学范文用对话推动情节的方法……" />
        </label>
      </section>

      {!result && (
        <button className="btn btn-sun" disabled={!aReady || bPick === null || cPick === null} onClick={submit}>
          📤 提交学习任务并评分
        </button>
      )}
      {!result && (!aReady || bPick === null || cPick === null) && <p className="text-xs text-muted-foreground">请完成任务 A、B、C 后再提交。评分完全依据本地预设答案，不评判开放式写作。</p>}
    </div>
  );
}
