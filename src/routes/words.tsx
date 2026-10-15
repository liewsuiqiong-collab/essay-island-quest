import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Feedback, PageHead, Progress } from "@/components/kit";
import { SENTENCE_TASKS, WORD_BANK, WORD_QUIZZES } from "@/lib/content";
import { checkSentence } from "@/lib/feedback";
import { award, giveBadge, recordWrong } from "@/lib/store";

export const Route = createFileRoute("/words")({
  head: () => ({
    meta: [
      { title: "词语与句子工坊 · 作文冒险岛" },
      { name: "description", content: "分类词语库与固定题库：词语搭配、近义词、填空、造句与句子改写。" },
      { property: "og:title", content: "词语与句子工坊 · 作文冒险岛" },
      { property: "og:description", content: "积累好词好句，练习用得准确。" },
    ],
  }),
  component: WordsPage,
});

function WordsPage() {
  const [tab, setTab] = useState<"bank" | "quiz" | "make">("quiz");
  return (
    <div>
      <PageHead icon="🧩" title="词语与句子工坊" desc="积累分类词语，再通过练习学会准确使用。" tone="sun" />
      <div className="mb-4 flex gap-1 rounded-full bg-muted p-1 sm:w-fit">
        {([["quiz", "词句测验"], ["make", "造句练习"], ["bank", "分类词库"]] as const).map(([k, l]) => (
          <button key={k} className={`btn flex-1 ${tab === k ? "btn-primary" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === "bank" && <Bank />}
      {tab === "quiz" && <Quiz />}
      {tab === "make" && <Make />}
    </div>
  );
}

function Bank() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(WORD_BANK).map(([cat, ws]) => (
        <div key={cat} className="card p-4">
          <h3 className="text-lg">{cat}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">{ws.map((w) => <span key={w} className="chip bg-sun-soft">{w}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function Quiz() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = WORD_QUIZZES[i]!;
  const ok = pick === q?.answer;

  const choose = (k: number) => {
    if (ok) return;
    setPick(k);
    setTries(tries + 1);
    if (k === q.answer && tries === 0) setScore(score + 1);
    if (k !== q.answer) recordWrong("quizWrong", q.id);
  };
  const next = () => {
    if (i + 1 >= WORD_QUIZZES.length) {
      setDone(true);
      award("words-quiz", 30, "词句工坊：完成一轮测验", "词句");
      if (score >= 6) giveBadge("words");
    } else { setI(i + 1); setPick(null); setTries(0); }
  };

  if (done)
    return (
      <div className="card p-8 text-center">
        <div className="text-5xl">🧩</div>
        <h3 className="mt-2 text-2xl">一次答对 {score}/{WORD_QUIZZES.length}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{score >= 6 ? "太棒了，获得「词句工匠」徽章！" : "一次答对 6 题以上可获得「词句工匠」徽章，再试一次吧。"}</p>
        <button className="btn btn-primary mt-4" onClick={() => { setI(0); setPick(null); setTries(0); setScore(0); setDone(false); }}>重新挑战</button>
      </div>
    );

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 text-sm"><span className="chip bg-sun-soft">{q.kind}</span><span className="shrink-0">{i + 1}/{WORD_QUIZZES.length}</span><Progress value={(i / WORD_QUIZZES.length) * 100} tone="sun" /></div>
      <h3 className="mt-4 text-xl">{q.q}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((o, k) => (
          <button key={k} onClick={() => choose(k)} className={`rounded-xl border-2 p-3 text-left transition hover:bg-muted ${pick === k ? (ok ? "border-success bg-mint-soft" : "border-warn bg-sun-soft") : ""}`}>{o}</button>
        ))}
      </div>
      {pick !== null && !ok && <Feedback kind="hint">不太对，再试一次。提示：{q.hint}</Feedback>}
      {ok && <Feedback kind="ok">正确！{q.explain}</Feedback>}
      {ok && <button className="btn btn-sun mt-4" onClick={next}>下一题 →</button>}
    </div>
  );
}

function Make() {
  const [w, setW] = useState<string>(SENTENCE_TASKS[0]!);
  const [s, setS] = useState("");
  const [r, setR] = useState<ReturnType<typeof checkSentence> | null>(null);
  return (
    <div className="card p-5">
      <p className="text-sm text-muted-foreground">选一个词语造句，句子要有具体情境。</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SENTENCE_TASKS.map((x) => <button key={x} className={`chip ${x === w ? "border-sun bg-sun-soft font-semibold" : ""}`} onClick={() => { setW(x); setR(null); }}>{x}</button>)}
      </div>
      <textarea className="field mt-3 min-h-24" placeholder={`用「${w}」造句……`} value={s} onChange={(e) => { setS(e.target.value); setR(null); }} />
      <button className="btn btn-primary mt-3" disabled={!s.trim()} onClick={() => {
        const res = checkSentence(w, s);
        setR(res);
        if (res.pass) award(`make-${w}`, 10, `造句：${w}`, "词句");
      }}>检查句子</button>
      {r && (r.pass ? <Feedback kind="ok">格式通过！（规则检查：包含词语、长度、标点）请自己再判断词义是否用得恰当。首次完成每个词 +10 XP。</Feedback> : <Feedback kind="hint"><ul className="list-disc pl-4">{r.tips.map((t) => <li key={t}>{t}</li>)}</ul></Feedback>)}
    </div>
  );
}
