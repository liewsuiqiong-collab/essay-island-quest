import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LocalNotice, PageHead } from "@/components/kit";
import { PLOT_STAGES, PEEL_STAGES } from "@/lib/content";
import { countChars, deleteEssay, fmtDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "我的成长作品集 · 作文冒险岛" },
      { name: "description", content: "查看每篇作文的题目、构思、初稿、修改稿、自我反思和日期。" },
      { property: "og:title", content: "我的成长作品集 · 作文冒险岛" },
      { property: "og:description", content: "记录每一次写作与修改的成长。" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const s = useStore();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div>
      <PageHead icon="📚" title="我的成长作品集" desc="每一次构思、初稿与修改都是你的成长足迹。" tone="mint" />
      {s.essays.length === 0 ? (
        <div className="card p-8 text-center"><p className="text-muted-foreground">还没有作品。</p><Link to="/challenge" className="btn btn-primary mt-3">去作文挑战赛</Link></div>
      ) : (
        <div className="space-y-3">
          {s.essays.map((e) => {
            const stages = e.type === "opinion" ? PEEL_STAGES : PLOT_STAGES;
            const isOpen = open === e.id;
            return (
              <div key={e.id} className="card overflow-hidden">
                <button className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted" onClick={() => setOpen(isOpen ? null : e.id)}>
                  <div>
                    <div className="text-xs text-muted-foreground">创建 {fmtDate(e.createdAt)} · 更新 {fmtDate(e.updatedAt)}</div>
                    <div className="mt-1 line-clamp-2 font-semibold">{e.title}</div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                    <span className="rounded-full bg-sky-soft px-2 py-0.5">{e.status}</span>
                    {e.checklist.length > 0 && <span className="rounded-full bg-mint-soft px-2 py-0.5">已自查 {e.checklist.length} 项</span>}
                  </div>
                </button>
                {isOpen && (
                  <div className="space-y-4 border-t p-4">
                    <Sec t="审题">关键词：{e.audit.keywords || "—"}；人物：{e.audit.people || "—"}；{e.type === "opinion" ? "立场" : "事件"}：{e.audit.event || "—"}；要求：{e.audit.requirement || "—"}</Sec>
                    <Sec t="构思">
                      <div className="grid gap-2 sm:grid-cols-2">{stages.map((st) => <div key={st.key} className="rounded-lg bg-muted p-2 text-sm"><strong>{st.label}：</strong>{e.plan[st.key] || "—"}</div>)}</div>
                    </Sec>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <Sec t={`初稿（${countChars(e.draft)} 字）`}><div className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm leading-relaxed">{e.draft || "—"}</div></Sec>
                      <Sec t={`修改稿（${countChars(e.revision)} 字）`}><div className="whitespace-pre-wrap rounded-lg bg-mint-soft p-3 text-sm leading-relaxed">{e.revision || "—"}</div></Sec>
                    </div>
                    <Sec t="自我反思">{e.reflection || "—"}</Sec>
                    <Sec t="自我检查">{e.checklist.length ? `已勾选 ${e.checklist.length} 项` : "尚未完成自查清单"}</Sec>
                    <div className="flex gap-2">
                      <Link to="/challenge" search={{ essay: e.id }} className="btn btn-primary">继续编辑</Link>
                      <button className="btn btn-ghost text-destructive" onClick={() => confirm("确定删除这篇作品？") && deleteEssay(e.id)}>删除</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6"><LocalNotice /></div>
    </div>
  );
}

function Sec({ t, children }: { t: string; children: React.ReactNode }) {
  return <div><h4 className="mb-1 font-display text-base text-primary">{t}</h4><div className="text-sm leading-relaxed">{children}</div></div>;
}
