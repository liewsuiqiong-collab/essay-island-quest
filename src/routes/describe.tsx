import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Feedback, PageHead } from "@/components/kit";
import { DESC_CHALLENGES } from "@/lib/content";
import { analyzeDescription } from "@/lib/feedback";
import { addDesc, award, fmtDate, giveBadge, now, uid, useStore } from "@/lib/store";

export const Route = createFileRoute("/describe")({
  head: () => ({
    meta: [
      { title: "描写魔法师 · 作文冒险岛" },
      { name: "description", content: "把「我很紧张」等普通句子升级，练习动作、神态、心理、语言、环境描写。" },
      { property: "og:title", content: "描写魔法师 · 作文冒险岛" },
      { property: "og:description", content: "分层提示引导你自己改写，展示修改前后对比。" },
    ],
  }),
  component: DescribePage,
});

function DescribePage() {
  const s = useStore();
  const [cid, setCid] = useState(DESC_CHALLENGES[0].id);
  const c = DESC_CHALLENGES.find((x) => x.id === cid)!;
  const [text, setText] = useState("");
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof analyzeDescription> | null>(null);
  const [showSample, setShowSample] = useState(false);
  const [saved, setSaved] = useState(false);

  const pick = (id: string) => { setCid(id); setText(""); setHints(0); setResult(null); setShowSample(false); setSaved(false); };
  const check = () => { setResult(analyzeDescription(text, c.banned)); setSaved(false); };
  const save = () => {
    if (!result?.pass) return;
    addDesc({ id: uid(), challengeId: c.id, original: c.original, rewrite: text, skills: result.found, date: now() });
    award(`desc-${c.id}`, 25, `描写魔法师：改写「${c.original}」`, "描写");
    const doneCount = new Set([...s.descs.map((d) => d.challengeId), c.id]).size;
    if (doneCount >= 2) giveBadge("describe");
    setSaved(true);
  };

  return (
    <div>
      <PageHead icon="✨" title="描写魔法师" desc="把平淡的句子施上魔法：用细节「展示」感受，而不是直接「告诉」。" tone="grape" />
      <div className="mb-4 flex flex-wrap gap-2">
        {DESC_CHALLENGES.map((x) => (
          <button key={x.id} onClick={() => pick(x.id)} className={`chip ${x.id === cid ? "border-grape bg-grape-soft font-semibold" : ""}`}>
            {s.descs.some((d) => d.challengeId === x.id) ? "✅ " : ""}{x.original}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-5">
          <div className="text-sm text-muted-foreground">{c.context}</div>
          <div className="mt-2 font-display text-3xl">原句：「{c.original}」</div>
          <textarea className="field mt-4 min-h-40" placeholder="在这里施展你的描写魔法……" value={text} onChange={(e) => { setText(e.target.value); setResult(null); }} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-primary" disabled={!text.trim()} onClick={check}>🔎 检查我的改写</button>
            {result?.pass && !saved && <button className="btn btn-sun" onClick={save}>✨ 保存到作品集 (+XP)</button>}
          </div>
          {result && (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {(["动作", "神态", "心理", "语言", "环境"] as const).map((k) => (
                  <span key={k} className={`rounded-full px-2 py-1 ${result.found.includes(k) ? "bg-mint-soft font-semibold text-success" : "bg-muted text-muted-foreground"}`}>{result.found.includes(k) ? "✓" : "○"} {k}</span>
                ))}
                <span className="rounded-full bg-muted px-2 py-1">{result.chars} 字</span>
              </div>
              {result.pass ? (
                <Feedback kind="ok">很棒！你用了 {result.found.length} 种描写手法，且没有直接写原句。规则检测只看关键词，请再自己读一遍是否通顺自然。</Feedback>
              ) : (
                <Feedback kind="hint"><ul className="list-disc pl-4">{result.tips.map((t) => <li key={t}>{t}</li>)}</ul></Feedback>
              )}
              <p className="mt-2 text-xs text-muted-foreground">※ 这是根据关键词规则的自动检查，不是 AI 批改。</p>
            </>
          )}
          {saved && <Feedback kind="ok">已保存！每个挑战首次完成可获得 25 XP，完成两个挑战可得「描写魔法师」徽章。</Feedback>}
          {saved && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-3"><div className="text-xs text-muted-foreground">修改前</div><p className="mt-1">{c.original}</p></div>
              <div className="rounded-xl bg-mint-soft p-3"><div className="text-xs text-muted-foreground">修改后</div><p className="mt-1 leading-relaxed">{text}</p></div>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-lg">🪄 分层提示</h3>
          <p className="text-xs text-muted-foreground">需要时一层层打开，先自己想。</p>
          <div className="mt-3 space-y-2">
            {c.hints.slice(0, hints).map((h, i) => (
              <div key={i} className="rounded-xl bg-grape-soft p-3 text-sm animate-in fade-in"><strong>{h.skill}：</strong>{h.text}</div>
            ))}
          </div>
          {hints < c.hints.length && <button className="btn btn-ghost mt-3" onClick={() => setHints(hints + 1)}>打开第 {hints + 1} 层提示</button>}
          <div className="mt-5 border-t pt-4">
            {result?.pass || saved ? (
              <>
                <button className="btn btn-ghost" onClick={() => setShowSample(!showSample)}>{showSample ? "收起" : "看看参考示范"}</button>
                {showSample && <p className="mt-2 rounded-xl bg-sky-soft p-3 text-sm leading-relaxed">{c.sample}</p>}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">🔒 通过检查后才能查看参考示范——先相信自己的笔！</p>
            )}
          </div>
        </div>
      </div>

      {s.descs.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-xl">修改前后对比记录</h2>
          <div className="space-y-3">
            {s.descs.map((d) => (
              <div key={d.id} className="card grid gap-3 p-4 sm:grid-cols-[1fr_2fr]">
                <div><div className="text-xs text-muted-foreground">{fmtDate(d.date)}</div><div className="mt-1 text-muted-foreground line-through">{d.original}</div></div>
                <div><p className="leading-relaxed">{d.rewrite}</p><div className="mt-1 text-xs text-success">用到：{d.skills.join("、")}</div></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
