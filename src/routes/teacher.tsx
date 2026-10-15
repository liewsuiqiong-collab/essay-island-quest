import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Feedback } from "@/components/kit";
import { AUDIT_CASES, BUILTIN_PROMPTS, CHECKLISTS, WORD_QUIZZES, type EssayType } from "@/lib/content";
import { addClassNote, addCustomPrompt, countChars, fmtDate, removeClassNote, removeCustomPrompt, setTeacherComment, uid, useStore, type State } from "@/lib/store";

export const Route = createFileRoute("/teacher")({
  head: () => ({
    meta: [
      { title: "教师后台（演示）· 作文冒险岛" },
      { name: "description", content: "练习管理、学生提交记录、教师评语、班级常见问题与 CSV 导出的演示界面。" },
      { property: "og:title", content: "教师后台 · 作文冒险岛" },
      { property: "og:description", content: "管理练习、查看提交、写评语、导出记录。" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Teacher,
});

const TABS = ["练习管理", "学生提交记录", "班级常见问题", "CSV 导出"] as const;

function Teacher() {
  const s = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("学生提交记录");
  return (
    <div>
      <div className="mb-5 rounded-2xl border-2 border-dashed border-grape bg-grape-soft p-4 text-sm leading-relaxed">
        <strong>演示模式说明：</strong>目前没有登录与云端数据库，此后台只能看到<strong>本设备浏览器</strong>中保存的作品。平台不含任何虚构学生资料；要演示流程，请先切换到学生界面完成一篇作文。正式版需接入登录与权限后才能跨设备查看全班记录。
      </div>
      <div className="mb-5 flex flex-wrap gap-1 rounded-2xl bg-muted p-1">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`btn flex-1 ${tab === t ? "bg-teacher text-primary-foreground" : ""}`}>{t}</button>)}
      </div>
      {tab === "练习管理" && <Manage s={s} />}
      {tab === "学生提交记录" && <Submissions s={s} />}
      {tab === "班级常见问题" && <Issues s={s} />}
      {tab === "CSV 导出" && <Export s={s} />}
    </div>
  );
}

function Manage({ s }: { s: State }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EssayType>("narrative");
  const [level, setLevel] = useState<"快捷华文" | "高级华文" | "通用">("通用");
  const [ok, setOk] = useState(false);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
      <div className="card space-y-3 p-5">
        <h3 className="text-lg">新增作文题目</h3>
        <textarea className="field min-h-24" placeholder="输入题目内容" value={title} onChange={(e) => { setTitle(e.target.value); setOk(false); }} />
        <div className="grid grid-cols-2 gap-2">
          <select className="field" value={type} onChange={(e) => setType(e.target.value as EssayType)}><option value="narrative">记叙文</option><option value="opinion">观点题（PEEL）</option></select>
          <select className="field" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}><option>通用</option><option>快捷华文</option><option>高级华文</option></select>
        </div>
        <button className="btn btn-primary" disabled={title.trim().length < 6} onClick={() => { addCustomPrompt({ id: uid(), title: title.trim(), type, level, tips: [], custom: true }); setTitle(""); setOk(true); }}>发布到作文挑战赛</button>
        {ok && <Feedback kind="ok">已发布（本设备）。学生界面「作文挑战赛」中可看到。</Feedback>}
      </div>
      <div className="card p-5">
        <h3 className="text-lg">现有练习</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {[...BUILTIN_PROMPTS, ...s.customPrompts].map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-2 rounded-xl border p-3">
              <div><span className="mr-2 rounded bg-muted px-1.5 text-xs">{p.type === "opinion" ? "观点" : "记叙"} · {p.level}</span>{p.title}</div>
              {p.custom ? <button className="shrink-0 text-xs text-destructive" onClick={() => removeCustomPrompt(p.id)}>删除</button> : <span className="shrink-0 text-xs text-muted-foreground">内置</span>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">另含内置：审题案件 {AUDIT_CASES.length} 套、词句测验 {WORD_QUIZZES.length} 题、描写挑战 3 个。</p>
      </div>
    </div>
  );
}

function Submissions({ s }: { s: State }) {
  const [sel, setSel] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const e = s.essays.find((x) => x.id === sel);
  if (s.essays.length === 0) return <div className="card p-8 text-center text-muted-foreground">本设备尚无学生提交记录。请到学生界面完成一篇作文后再回来演示。</div>;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
      <div className="card divide-y">
        {s.essays.map((x) => (
          <button key={x.id} onClick={() => { setSel(x.id); setDraft(x.teacherComment); setSaved(false); }} className={`block w-full p-3 text-left text-sm hover:bg-muted ${sel === x.id ? "bg-grape-soft" : ""}`}>
            <div className="font-semibold">{s.name || "本机学生"} · {x.status}</div>
            <div className="line-clamp-1 text-muted-foreground">{x.title}</div>
            <div className="text-xs text-muted-foreground">{fmtDate(x.updatedAt)} {x.teacherComment && "· 已评语"}</div>
          </button>
        ))}
      </div>
      <div className="card p-5">
        {!e ? <p className="text-muted-foreground">← 选择一份作品查看</p> : (
          <div className="space-y-3">
            <p className="font-semibold">{e.title}</p>
            <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-muted px-2 py-0.5">初稿 {countChars(e.draft)} 字</span><span className="rounded bg-muted px-2 py-0.5">修改稿 {countChars(e.revision)} 字</span><span className="rounded bg-muted px-2 py-0.5">自查 {e.checklist.length}/{CHECKLISTS[e.type].length}</span></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><div className="text-xs text-muted-foreground">初稿</div><div className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{e.draft || "—"}</div></div>
              <div><div className="text-xs text-muted-foreground">修改稿</div><div className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-mint-soft p-3 text-sm">{e.revision || "—"}</div></div>
            </div>
            <div><div className="text-xs text-muted-foreground">学生反思</div><p className="text-sm">{e.reflection || "—"}</p></div>
            <label className="block text-sm">教师评语
              <textarea className="field mt-1 min-h-28" value={draft} onChange={(ev) => { setDraft(ev.target.value); setSaved(false); }} placeholder="写下具体、可操作的建议……" />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["高潮部分细节描写生动，继续保持！", "请扣紧题目关键词，避免偏题。", "结尾的感悟可以写得更具体。", "观点句清楚，但例子需要更具体。"].map((q) => <button key={q} className="chip text-xs" onClick={() => setDraft(draft ? draft + "\n" + q : q)}>+ {q}</button>)}
            </div>
            <button className="btn bg-teacher text-primary-foreground" onClick={() => { setTeacherComment(e.id, draft); setSaved(true); }}>保存评语</button>
            {saved && <Feedback kind="ok">评语已保存，学生可在本设备的「作品集」中看到。</Feedback>}
          </div>
        )}
      </div>
    </div>
  );
}

function Issues({ s }: { s: State }) {
  const [note, setNote] = useState("");
  const unchecked: Record<string, number> = {};
  s.essays.filter((e) => e.status !== "构思中").forEach((e) => CHECKLISTS[e.type].forEach((c) => { if (!e.checklist.includes(c)) unchecked[c] = (unchecked[c] ?? 0) + 1; }));
  const quizTop = Object.entries(s.stats.quizWrong).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const auditTotal = Object.values(s.stats.auditWrong).reduce((a, b) => a + b, 0);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card p-5">
        <h3 className="text-lg">📊 由练习数据自动统计（本设备）</h3>
        <p className="mt-2 text-sm">审题侦探答错次数：<strong>{auditTotal}</strong></p>
        <h4 className="mt-3 text-sm font-semibold">词句测验易错题</h4>
        {quizTop.length === 0 ? <p className="text-sm text-muted-foreground">暂无数据</p> : (
          <ul className="mt-1 space-y-1 text-sm">{quizTop.map(([id, n]) => <li key={id}>• {WORD_QUIZZES.find((q) => q.id === id)?.q}（错 {n} 次）</li>)}</ul>
        )}
        <h4 className="mt-3 text-sm font-semibold">自查清单未勾选项</h4>
        {Object.keys(unchecked).length === 0 ? <p className="text-sm text-muted-foreground">暂无数据</p> : <ul className="mt-1 space-y-1 text-sm">{Object.entries(unchecked).map(([c, n]) => <li key={c}>• {c}（{n}）</li>)}</ul>}
      </div>
      <div className="card p-5">
        <h3 className="text-lg">📝 教师记录的班级常见问题</h3>
        <div className="mt-3 flex gap-2"><input className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：许多同学高潮部分写得太快" /><button className="btn btn-primary shrink-0" disabled={!note.trim()} onClick={() => { addClassNote(note.trim()); setNote(""); }}>添加</button></div>
        <ul className="mt-3 space-y-2 text-sm">{s.classNotes.map((n, i) => <li key={i} className="flex justify-between gap-2 rounded-lg bg-muted p-2">{n}<button className="text-xs text-destructive" onClick={() => removeClassNote(i)}>删除</button></li>)}</ul>
      </div>
    </div>
  );
}

function Export({ s }: { s: State }) {
  const download = () => {
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const rows = [["学生", "题目", "文体", "状态", "初稿字数", "修改稿字数", "初稿", "修改稿", "反思", "教师评语", "创建日期", "更新日期"]];
    s.essays.forEach((e) => rows.push([s.name, e.title, e.type === "opinion" ? "观点" : "记叙", e.status, String(countChars(e.draft)), String(countChars(e.revision)), e.draft, e.revision, e.reflection, e.teacherComment, e.createdAt, e.updatedAt]));
    const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `作文冒险岛-提交记录-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="card p-6">
      <h3 className="text-lg">导出提交记录（CSV）</h3>
      <p className="mt-2 text-sm text-muted-foreground">包含题目、状态、字数、初稿、修改稿、反思、评语与日期。文件可用 Excel 打开（已含 UTF-8 BOM，中文不乱码）。目前只导出本设备的 {s.essays.length} 条记录。</p>
      <button className="btn bg-teacher mt-4 text-primary-foreground" disabled={!s.essays.length} onClick={download}>⬇️ 下载 CSV</button>
    </div>
  );
}
