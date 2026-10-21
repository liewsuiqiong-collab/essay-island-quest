import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BADGES, countChars, fmtDate, useStore, type Essay } from "@/lib/store";
import { CHALLENGE_PLAN_FIELDS, CHECKLISTS, MODEL_ESSAYS } from "@/lib/content";
import { STATIONS, encouragement, stars, stationScore, totalScore, TOTAL_MAX } from "@/lib/scores";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "我的学习报告 · 作文闯关岛" },
      { name: "description", content: "各站得分、作文与反思成果报告，可打印或另存为 PDF。" },
      { property: "og:title", content: "我的学习报告 · 作文闯关岛" },
      { property: "og:description", content: "作文闯关岛学习成果报告。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

function rank(e: Essay) {
  return (e.status === "修改稿已提交" ? 3 : e.status === "初稿已提交" ? 2 : 1) * 1e13 + new Date(e.updatedAt).getTime();
}

function ReportPage() {
  const s = useStore();
  const ordered = [...s.essays].sort((a, b) => rank(b) - rank(a));
  const [essayId, setEssayId] = useState<string | null>(null);
  const essay = ordered.find((e) => e.id === essayId) ?? ordered[0] ?? null;
  const museum = essay ? s.museumResults[essay.promptId] : undefined;
  const total = totalScore(s);
  const starCount = stars(total);

  return (
    <div className="report-page mx-auto max-w-3xl">
      <div className="no-print card mb-4 flex flex-wrap items-center gap-3 p-4">
        <div className="flex-1 text-sm text-muted-foreground">
          点击「生成 PDF」会打开浏览器打印对话框，请选择<strong>「另存为 PDF / Save as PDF」</strong>。保存后自行打开 Google Classroom，进入老师指定的作业，附加 PDF 并点击「提交」——本站不会自动上传。
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ 生成我的学习报告（PDF）</button>
        <Link to="/" className="btn btn-ghost">返回地图</Link>
      </div>

      {ordered.length > 1 && (
        <div className="no-print card mb-4 flex items-center gap-3 p-4 text-sm">
          <span>报告包含的作文：</span>
          <select className="field max-w-md" value={essay?.id ?? ""} onChange={(e) => setEssayId(e.target.value)}>
            {ordered.map((e) => <option key={e.id} value={e.id}>{e.title.slice(0, 24)}…（{e.status}）</option>)}
          </select>
        </div>
      )}

      <article className="report-sheet card p-6 sm:p-10">
        <header className="border-b-2 border-dashed pb-5 text-center">
          <h1 className="text-3xl">🏝️ 作文闯关岛 · 学习报告</h1>
          <p className="mt-2 text-sm text-muted-foreground">华文写作复习冒险 · 五站闯关</p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm">
            <span>姓名：<strong>{s.name || "（未填写）"}</strong></span>
            <span>班级：<strong>{s.className || "（未填写）"}</strong></span>
            <span>学习日期：<strong>{fmtDate(new Date().toISOString()).slice(0, 9)}</strong></span>
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-xl">一、闯关成绩（总分 {total}/{TOTAL_MAX}）</h2>
          <table className="mt-3 w-full border-collapse text-sm">
            <thead><tr className="bg-muted"><th className="border p-2 text-left">关卡</th><th className="border p-2">建议用时</th><th className="border p-2">得分</th><th className="border p-2">状态</th></tr></thead>
            <tbody>
              {STATIONS.map((st) => {
                const sc = stationScore(s, st.id);
                return (
                  <tr key={st.id}>
                    <td className="border p-2">{st.name}</td>
                    <td className="border p-2 text-center">{st.time}</td>
                    <td className="border p-2 text-center font-semibold">{sc === null ? "—" : `${sc}/${st.max}`}</td>
                    <td className="border p-2 text-center">{sc === null ? "未完成" : "已完成"}</td>
                  </tr>
                );
              })}
              <tr className="bg-sun-soft"><td className="border p-2 font-bold">总分</td><td className="border p-2" /><td className="border p-2 text-center font-bold">{total}/{TOTAL_MAX}</td><td className="border p-2 text-center">{"★".repeat(starCount)}{"☆".repeat(3 - starCount)}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-sm">获得徽章：{s.badges.length ? s.badges.map((b) => `${BADGES[b]?.icon ?? ""}${BADGES[b]?.name ?? b}`).join("、") : "（暂无）"}</p>
          <p className="mt-2 rounded-xl bg-mint-soft p-3 text-sm font-medium">💬 {encouragement(total)}</p>
          <p className="mt-2 text-xs text-muted-foreground">说明：各站得分来自预设答案的选择题、结构辨认与完成度检查，由规则自动评分，不评判开放式作文的质量。</p>
        </section>

        {essay ? (
          <section className="mt-8">
            <h2 className="text-xl">二、我的作文（{essay.status}）</h2>
            <p className="mt-3 rounded-xl bg-muted p-3 text-sm leading-relaxed"><strong>题目：</strong>{essay.title}</p>

            <h3 className="mt-5 font-semibold">内容规划</h3>
            <div className="mt-2 grid gap-2 text-sm">
              {CHALLENGE_PLAN_FIELDS.map((f) => (
                <div key={f.key} className="rounded-lg border p-2"><strong>{f.label}：</strong>{essay.plan[f.key]?.trim() || "（未填写）"}</div>
              ))}
            </div>

            <h3 className="mt-5 font-semibold">作文全文{essay.status === "修改稿已提交" ? "（修改稿）" : "（初稿）"}（{countChars(essay.status === "修改稿已提交" ? essay.revision : essay.draft)} 字）</h3>
            <div className="mt-2 whitespace-pre-wrap rounded-lg border p-4 leading-loose">{essay.status === "修改稿已提交" ? essay.revision : essay.draft}</div>

            <h3 className="mt-5 font-semibold">自我检查清单</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {CHECKLISTS[essay.type].map((c) => <li key={c}>{essay.checklist.includes(c) ? "☑" : "☐"} {c}</li>)}
            </ul>

            <h3 className="mt-5 font-semibold">自我反思</h3>
            <div className="mt-2 whitespace-pre-wrap rounded-lg border p-3 text-sm leading-relaxed">{essay.reflection.trim() || "（未填写）"}</div>
          </section>
        ) : (
          <section className="mt-8"><h2 className="text-xl">二、我的作文</h2><p className="mt-2 text-sm text-muted-foreground">还没有作文记录。请先到「作文终极挑战」完成一篇作文。</p></section>
        )}

        <section className="mt-8">
          <h2 className="text-xl">三、范文学习任务</h2>
          {essay && museum ? (
            <div className="mt-3 text-sm">
              <p>对应题目范文（{(MODEL_ESSAYS[essay.promptId]?.[0]?.kind) ?? "课堂参考"}）：</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-sky-soft p-3">A. 结构侦探：<strong>{museum.a}/4 分</strong></div>
                <div className="rounded-lg bg-mint-soft p-3">B. 描写侦探：<strong>{museum.b}/8 分</strong></div>
                <div className="rounded-lg bg-sun-soft p-3">C. 写作迁移：<strong>{museum.c}/8 分</strong></div>
              </div>
              <p className="mt-2">合计：<strong>{museum.total}/20 分</strong></p>
              {museum.cText.trim() && <p className="mt-2 rounded-lg border p-3">我想借鉴的写法：{museum.cText}</p>}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">尚未完成范文学习任务。写完作文并通过自我检查后，到「范文学习馆」解锁。</p>
          )}
        </section>

        <footer className="mt-10 border-t pt-4 text-xs text-muted-foreground">
          本报告由「作文闯关岛」在本设备浏览器中生成，所有数据仅保存于本机，未上传到任何服务器。
        </footer>
      </article>
    </div>
  );
}
