import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Feedback, LocalNotice, PageHead, Progress } from "@/components/kit";
import { PlanBoard, planFilled } from "@/components/PlanBoard";
import { BUILTIN_PROMPTS } from "@/lib/content";
import { award, deletePlan, fmtDate, giveBadge, now, savePlan, uid, useStore, type PlotPlan } from "@/lib/store";

export const Route = createFileRoute("/plot")({
  head: () => ({
    meta: [
      { title: "情节设计师 · 作文冒险岛" },
      { name: "description", content: "用开端、发展、高潮、结局、反思故事规划板构思作文，并保存构思。" },
      { property: "og:title", content: "情节设计师 · 作文冒险岛" },
      { property: "og:description", content: "跟着引导问题，一步步设计好情节。" },
    ],
  }),
  component: PlotPage,
});

const blank = (): PlotPlan => ({ id: uid(), title: BUILTIN_PROMPTS[0]!.title, mode: "narrative", fields: {}, updatedAt: now() });

function PlotPage() {
  const s = useStore();
  const [p, setP] = useState<PlotPlan>(blank);
  const [msg, setMsg] = useState<string | null>(null);
  const fill = planFilled(p.mode, p.fields);

  const save = () => {
    savePlan({ ...p, updatedAt: now() });
    if (fill === 1) {
      award(`plot-${p.id}`, 30, "情节设计师：保存一份完整构思", "构思");
      giveBadge("plot");
      setMsg("构思已保存！每个部分都有内容，获得 30 XP（每份构思只计一次）。");
    } else setMsg(`构思已保存。目前完成 ${Math.round(fill * 100)}%，每部分至少写 6 个字，全部完成后可获得 XP。`);
  };

  return (
    <div>
      <PageHead icon="🗺️" title="情节设计师" desc="先想好故事骨架，再动笔。每格都有引导问题帮你思考。" tone="mint" />
      <div className="card space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="text-sm">
            作文题目
            <select className="field mt-1" value={BUILTIN_PROMPTS.some((x) => x.title === p.title) ? p.title : "__custom"} onChange={(e) => {
              const pr = BUILTIN_PROMPTS.find((x) => x.title === e.target.value);
              setP({ ...p, title: pr ? pr.title : "", mode: pr?.type === "opinion" ? "peel" : "narrative" });
            }}>
              {BUILTIN_PROMPTS.map((x) => <option key={x.id} value={x.title}>{x.title.slice(0, 40)}…</option>)}
              <option value="__custom">自定义题目</option>
            </select>
          </label>
          <div className="text-sm">
            规划方式
            <div className="mt-1 flex gap-1 rounded-full bg-muted p-1">
              <button className={`btn ${p.mode === "narrative" ? "btn-primary" : ""}`} onClick={() => setP({ ...p, mode: "narrative" })}>记叙五步</button>
              <button className={`btn ${p.mode === "peel" ? "btn-primary" : ""}`} onClick={() => setP({ ...p, mode: "peel" })}>观点 PEEL</button>
            </div>
          </div>
        </div>
        {!BUILTIN_PROMPTS.some((x) => x.title === p.title) && (
          <input className="field" placeholder="输入自定义题目" value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} />
        )}
        <div className="flex items-center gap-3 text-sm"><span className="shrink-0">完成度</span><Progress value={fill * 100} tone="mint" /></div>
        <PlanBoard mode={p.mode} value={p.fields} onChange={(fields) => { setP({ ...p, fields }); setMsg(null); }} />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={save}>💾 保存构思</button>
          <button className="btn btn-ghost" onClick={() => { setP(blank()); setMsg(null); }}>新建构思</button>
        </div>
        {msg && <Feedback kind={fill === 1 ? "ok" : "info"}>{msg}</Feedback>}
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-xl">我保存的构思（{s.plans.length}）</h2>
        {s.plans.length === 0 ? <p className="text-sm text-muted-foreground">还没有保存的构思。</p> : (
          <div className="grid gap-3 md:grid-cols-2">
            {s.plans.map((x) => (
              <div key={x.id} className="card p-4">
                <div className="text-xs text-muted-foreground">{x.mode === "peel" ? "PEEL" : "记叙五步"} · {fmtDate(x.updatedAt)}</div>
                <div className="mt-1 line-clamp-2 font-semibold">{x.title || "（未命名）"}</div>
                <div className="mt-3 flex gap-2">
                  <button className="btn btn-ghost" onClick={() => { setP(x); window.scrollTo({ top: 0, behavior: "smooth" }); }}>继续编辑</button>
                  <button className="btn btn-ghost text-destructive" onClick={() => confirm("确定删除这份构思？") && deletePlan(x.id)}>删除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6"><LocalNotice /></div>
    </div>
  );
}
