import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Feedback, LocalNotice, PageHead, Progress } from "@/components/kit";
import { PlanBoard } from "@/components/PlanBoard";
import { BUILTIN_PROMPTS, CHALLENGE_PROMPTS, CHECKLISTS, MODEL_ESSAYS, type EssayPrompt } from "@/lib/content";
import { changedChars, essayHints } from "@/lib/feedback";
import { award, countChars, fmtDate, giveBadge, now, uid, upsertEssay, useStore, type Essay } from "@/lib/store";

export const Route = createFileRoute("/challenge")({
  validateSearch: (s: Record<string, unknown>): { essay?: string } => (typeof s["essay"] === "string" ? { essay: s["essay"] } : {}),
  head: () => ({
    meta: [
      { title: "作文挑战赛 · 作文冒险岛" },
      { name: "description", content: "独立写作：审题、构思、写初稿、自我检查、修改稿与反思，一步步完成作文。" },
      { property: "og:title", content: "作文挑战赛 · 作文冒险岛" },
      { property: "og:description", content: "记叙文练情节与细节，观点题用 PEEL 框架。" },
    ],
  }),
  component: ChallengePage,
});

function newEssay(p: EssayPrompt): Essay {
  return { id: uid(), promptId: p.id, title: p.title, type: p.type, audit: { keywords: "", people: "", event: "", requirement: "" }, plan: {}, draft: "", revision: "", checklist: [], reflection: "", status: "构思中", teacherComment: "", createdAt: now(), updatedAt: now() };
}

function ChallengePage() {
  const s = useStore();
  const { essay: essayId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const prompts = [...CHALLENGE_PROMPTS, ...s.customPrompts];
  const current = s.essays.find((e) => e.id === essayId);

  if (current) return <Editor key={current.id} initial={current} onBack={() => navigate({ search: {} })} />;

  return (
    <div>
      <PageHead icon="🏆" title="作文挑战赛" desc="独立完成一篇作文：审题 → 构思 → 初稿 → 自查 → 修改 → 反思。" />
      <h2 className="mb-3 text-xl">选择题目开始</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((p) => (
          <div key={p.id} className="card flex flex-col p-5">
            <div className="flex gap-2 text-xs">
              {p.label && <span className="rounded-full bg-sky-soft px-2 py-0.5 font-semibold">{p.label}</span>}
              <span className={`rounded-full px-2 py-0.5 ${p.type === "opinion" ? "bg-grape-soft" : "bg-mint-soft"}`}>{p.type === "opinion" ? "观点题 · PEEL" : "记叙文"}</span>
              <span className="rounded-full bg-muted px-2 py-0.5">{p.level}</span>
              {p.custom && <span className="rounded-full bg-sun-soft px-2 py-0.5">老师新增</span>}
            </div>
            <p className="mt-3 flex-1 leading-relaxed">{p.title}</p>
            {MODEL_ESSAYS[p.id] && <p className="mt-2 text-xs text-muted-foreground">📖 提交初稿后可查看 {MODEL_ESSAYS[p.id].length} 篇参考范文</p>}
            <button className="btn btn-primary mt-4" onClick={() => { const e = newEssay(p); upsertEssay(e); navigate({ search: { essay: e.id } }); }}>开始挑战</button>
          </div>
        ))}
      </div>
      {s.essays.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl">继续未完成的作品</h2>
          <div className="space-y-2">
            {s.essays.map((e) => (
              <Link key={e.id} to="/challenge" search={{ essay: e.id }} className="card flex items-center justify-between gap-3 p-4 hover:bg-muted">
                <span className="line-clamp-1">{e.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{e.status} · {fmtDate(e.updatedAt)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

const STEPS = ["审题", "构思", "初稿", "自查", "修改稿", "反思"] as const;

function Editor({ initial, onBack }: { initial: Essay; onBack: () => void }) {
  const [e, setE] = useState<Essay>(initial);
  const [step, setStep] = useState(initial.reflection ? 5 : initial.status === "初稿已提交" ? 4 : initial.draft ? 2 : 0);
  const [msg, setMsg] = useState<{ k: "ok" | "hint" | "info"; t: string } | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const prompt = BUILTIN_PROMPTS.find((p) => p.id === e.promptId);
  const draftLocked = e.status !== "构思中";

  // 每 20 秒自动保存草稿
  useEffect(() => {
    const t = setInterval(() => { upsertEssay(e); setSavedAt(new Date().toLocaleTimeString("zh-SG")); }, 20000);
    return () => clearInterval(t);
  }, [e]);

  const up = (patch: Partial<Essay>) => { setE({ ...e, ...patch }); setMsg(null); };
  const save = (t = "草稿已保存到本设备。") => { upsertEssay(e); setSavedAt(new Date().toLocaleTimeString("zh-SG")); setMsg({ k: "info", t }); };
  const go = (n: number) => { upsertEssay(e); setStep(n); setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submitDraft = () => {
    const n = countChars(e.draft);
    if (n < 150) return setMsg({ k: "hint", t: `初稿目前 ${n} 字，至少写到 150 字才能提交。` });
    if (e.checklist.length < CHECKLISTS[e.type].length) return setMsg({ k: "hint", t: "请先完成自查清单中的每一项（如实勾选，没做到的回去修改）。" });
    const next = { ...e, status: "初稿已提交" as const, revision: e.revision || e.draft };
    setE(next); upsertEssay(next);
    award(`essay-draft-${e.id}`, 40, "作文挑战：提交初稿", "构思");
    giveBadge("challenge");
    setMsg({ k: "ok", t: "初稿已提交！+40 XP。初稿已锁定保留，接下来在「修改稿」中修改。" });
    setStep(4);
  };

  const diff = changedChars(e.draft, e.revision);
  const submitRevision = () => {
    const need = Math.max(30, Math.round(countChars(e.draft) * 0.08));
    if (diff < need) return setMsg({ k: "hint", t: `修改稿与初稿只差约 ${diff} 个字。认真修改（至少改动约 ${need} 字）才能获得修改 XP，试着加强高潮描写或修正结构。` });
    const next = { ...e, status: "修改稿已提交" as const };
    setE(next); upsertEssay(next);
    award(`essay-rev-${e.id}`, 50, "作文挑战：认真修改并提交修改稿", "修改");
    giveBadge("reviser");
    setMsg({ k: "ok", t: `修改稿已提交！改动约 ${diff} 字，+50 XP，获得「认真修改家」徽章。` });
  };

  const submitReflection = () => {
    const n = countChars(e.reflection);
    if (n < 30) return setMsg({ k: "hint", t: `反思目前 ${n} 字，请至少写 30 字：你改了什么？为什么？下次要注意什么？` });
    upsertEssay(e);
    award(`essay-ref-${e.id}`, 20, "作文挑战：完成自我反思", "修改");
    giveBadge("reflector");
    setMsg({ k: "ok", t: "反思已保存！+20 XP。可以到「我的成长作品集」查看完整记录。" });
  };

  const auditOk = Object.values(e.audit).every((v) => v.trim().length >= 2);
  const hints = step === 2 && e.draft ? essayHints(e.type, e.draft) : step === 4 && e.revision ? essayHints(e.type, e.revision) : [];

  return (
    <div>
      <button onClick={() => { upsertEssay(e); onBack(); }} className="text-sm text-muted-foreground hover:text-primary">← 返回题目列表</button>
      <div className="card mt-2 p-5">
        <div className="text-xs text-muted-foreground">{e.type === "opinion" ? "观点题 · PEEL 框架" : "记叙文 · 情节、细节、人物刻画"} · 状态：{e.status}</div>
        <p className="mt-1 text-lg leading-relaxed">{e.title}</p>
        <div className="mt-4 flex gap-1 overflow-x-auto">
          {STEPS.map((st, i) => (
            <button key={st} onClick={() => go(i)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${i === step ? "bg-primary font-semibold text-primary-foreground" : "bg-muted"}`}>{i + 1}. {st}</button>
          ))}
        </div>
        <div className="mt-3"><Progress value={((step + 1) / STEPS.length) * 100} /></div>
      </div>

      <div className="card mt-4 p-5">
        {step === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl">第一步：审题</h3>
            {prompt && <Feedback kind="info">提示：{prompt.tips.join("；")}</Feedback>}
            {([["keywords", "题目关键词"], ["people", "主要人物 / 讨论对象"], ["event", e.type === "opinion" ? "我的立场" : "主要事件"], ["requirement", "写作要求"]] as const).map(([k, l]) => (
              <label key={k} className="block text-sm">{l}<input className="field mt-1" value={e.audit[k]} onChange={(ev) => up({ audit: { ...e.audit, [k]: ev.target.value } })} /></label>
            ))}
            <button className="btn btn-primary" disabled={!auditOk} onClick={() => { award(`essay-audit-${e.id}`, 10, "作文挑战：完成审题", "审题"); go(1); }}>完成审题，下一步 →</button>
            {!auditOk && <p className="text-xs text-muted-foreground">每一栏至少写 2 个字。</p>}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h3 className="text-xl">第二步：构思 {e.type === "opinion" ? "（PEEL：观点、解释、例子、联系）" : "（开端→发展→高潮→结局→反思）"}</h3>
            <PlanBoard mode={e.type === "opinion" ? "peel" : "narrative"} value={e.plan} onChange={(plan) => up({ plan })} />
            {e.type === "opinion" && <p className="text-xs text-muted-foreground">PEEL 适用于每个主体段。有两个理由时，可在每格分别写「理由一 / 理由二」。</p>}
            <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => save("构思已保存。")}>保存构思</button><button className="btn btn-primary" onClick={() => go(2)}>开始写作 →</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xl">第三步：写初稿</h3><span className="text-sm text-muted-foreground">{countChars(e.draft)} 字</span></div>
            {draftLocked && <Feedback kind="info">初稿已提交并锁定保存，请在「修改稿」中继续修改。</Feedback>}
            <textarea className="field min-h-[420px] text-base" readOnly={draftLocked} placeholder="独立完成你的作文。按 Enter 换行分段。" value={e.draft} onChange={(ev) => up({ draft: ev.target.value })} />
            {hints.length > 0 && !draftLocked && <Feedback kind="hint"><div className="mb-1 font-semibold">规则式提醒（非 AI 批改）：</div><ul className="list-disc pl-4">{hints.map((t) => <li key={t}>{t}</li>)}</ul></Feedback>}
            {!draftLocked && <div className="flex gap-2"><button className="btn btn-ghost" onClick={() => save()}>💾 保存草稿</button><button className="btn btn-primary" onClick={() => go(3)}>写完了，去自查 →</button></div>}
            {savedAt && <p className="text-xs text-muted-foreground">上次保存：{savedAt}（每 20 秒自动保存）</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl">第四步：自我检查清单</h3>
            <p className="text-sm text-muted-foreground">如实勾选。没做到的项目，请回到初稿修改后再勾选。</p>
            {CHECKLISTS[e.type].map((c) => (
              <label key={c} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${e.checklist.includes(c) ? "bg-mint-soft" : ""}`}>
                <input type="checkbox" className="h-5 w-5 accent-primary" disabled={draftLocked} checked={e.checklist.includes(c)} onChange={() => up({ checklist: e.checklist.includes(c) ? e.checklist.filter((x) => x !== c) : [...e.checklist, c] })} />
                <span>{c}</span>
              </label>
            ))}
            {!draftLocked ? <button className="btn btn-sun" onClick={submitDraft}>📤 提交初稿</button> : <button className="btn btn-primary" onClick={() => go(4)}>去写修改稿 →</button>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl">第五步：修改稿</h3>
            {!draftLocked ? <Feedback kind="hint">请先完成自查并提交初稿。</Feedback> : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div><div className="mb-1 text-sm text-muted-foreground">初稿（{countChars(e.draft)} 字，只读）</div><div className="field min-h-[380px] whitespace-pre-wrap bg-muted">{e.draft}</div></div>
                  <div><div className="mb-1 text-sm text-muted-foreground">修改稿（{countChars(e.revision)} 字 · 改动约 {diff} 字）</div><textarea className="field min-h-[380px] text-base" value={e.revision} onChange={(ev) => up({ revision: ev.target.value })} /></div>
                </div>
                {hints.length > 0 && <Feedback kind="hint"><div className="mb-1 font-semibold">修改方向（规则式提醒）：</div><ul className="list-disc pl-4">{hints.map((t) => <li key={t}>{t}</li>)}</ul></Feedback>}
                <div className="flex flex-wrap gap-2"><button className="btn btn-ghost" onClick={() => save("修改稿已保存。")}>💾 保存修改稿</button><button className="btn btn-sun" onClick={submitRevision}>📤 提交修改稿</button><button className="btn btn-primary" onClick={() => go(5)}>写反思 →</button></div>
                <ModelEssays promptId={e.promptId} />
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <h3 className="text-xl">第六步：自我反思</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground"><li>这次我主要修改了哪里？为什么？</li><li>我觉得写得最好的一段是哪段？</li><li>下次写作我要特别注意什么？</li></ul>
            <textarea className="field min-h-40" value={e.reflection} onChange={(ev) => up({ reflection: ev.target.value })} />
            <div className="flex gap-2"><button className="btn btn-sun" onClick={submitReflection}>保存反思</button><Link to="/portfolio" className="btn btn-ghost">查看作品集</Link></div>
            <ModelEssays promptId={e.promptId} />
          </div>
        )}
        {msg && <Feedback kind={msg.k}>{msg.t}</Feedback>}
      </div>
      <div className="mt-4"><LocalNotice /></div>
    </div>
  );
}
