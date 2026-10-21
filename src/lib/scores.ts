// 五站闯关计分规则（全部本地、规则式、可解释，无 AI）。
import { CHALLENGE_PLAN_FIELDS, CHECKLISTS } from "./content";
import { changedChars } from "./feedback";
import { countChars, type State, type Essay } from "./store";

export interface Station {
  id: string;
  name: string;
  to: string;
  time: string;
  max: number;
  subtitle: string;
}

export const STATIONS: Station[] = [
  { id: "audit", name: "内容寻宝岛", to: "/audit", time: "约 15 分钟", max: 20, subtitle: "审题侦探：发现题目里的秘密" },
  { id: "words", name: "词语魔法屋", to: "/words", time: "约 15 分钟", max: 20, subtitle: "词句工坊：收集有力量的词语" },
  { id: "describe", name: "句子升级站", to: "/describe", time: "约 15 分钟", max: 20, subtitle: "描写魔法师：让句子闪闪发光" },
  { id: "museum", name: "范文学习馆", to: "/museum", time: "约 20 分钟", max: 20, subtitle: "读范文、学方法，不照抄" },
  { id: "challenge", name: "作文终极挑战", to: "/challenge", time: "约 25 分钟", max: 20, subtitle: "写下属于你的故事" },
];

export const TOTAL_MAX = STATIONS.reduce((n, st) => n + st.max, 0); // 100

export const stationScore = (s: State, id: string): number | null =>
  typeof s.scores?.[id] === "number" ? s.scores[id]! : null;

export const totalScore = (s: State): number => STATIONS.reduce((n, st) => n + (stationScore(s, st.id) ?? 0), 0);

/** 解锁规则：第一站总是解锁；之后每一站需先完成前一站（先读范文，再写终极挑战作文）。 */
export function stationUnlocked(s: State, id: string): boolean {
  const i = STATIONS.findIndex((st) => st.id === id);
  if (i <= 0) return true;
  return stationScore(s, STATIONS[i - 1]!.id) !== null;
}

export const stationDone = (s: State, id: string) => stationScore(s, id) !== null;

export function stars(total: number): number {
  if (total >= 90) return 3;
  if (total >= 70) return 2;
  if (total >= 40) return 1;
  return 0;
}

export function encouragement(total: number): string {
  if (total >= 90) return "太出色了！你已经是真正的作文冒险家，继续保持这份热情！";
  if (total >= 70) return "表现很棒！再检查一下失分的关卡，下次冲击三颗星！";
  if (total >= 40) return "不错的开始！回到失分较多的岛屿再练一练，你会进步得更快。";
  return "冒险才刚刚开始，别灰心！一个岛一个岛慢慢来。";
}

/* ---- 作文终极挑战计分（满分 20）：只看可验证的完成度，不评判作文质量 ---- */
export function challengeScore(e: Essay): { total: number; rows: { label: string; points: number; max: number }[] } {
  const auditDone = Object.values(e.audit).every((v) => v.trim().length >= 2);
  const planDone = CHALLENGE_PLAN_FIELDS.filter((f) => (e.plan[f.key] ?? "").trim().length >= 2).length;
  const draftDone = e.status !== "构思中" && countChars(e.draft) >= 150;
  const checkDone = e.checklist.length >= CHECKLISTS[e.type].length;
  const revDone = e.status === "修改稿已提交" && changedChars(e.draft, e.revision) >= Math.max(30, Math.round(countChars(e.draft) * 0.08));
  const refDone = countChars(e.reflection) >= 30;
  const rows = [
    { label: "完成审题四栏", points: auditDone ? 3 : 0, max: 3 },
    { label: `填写内容规划（${planDone}/${CHALLENGE_PLAN_FIELDS.length} 栏）`, points: planDone >= CHALLENGE_PLAN_FIELDS.length ? 4 : planDone >= 3 ? 2 : 0, max: 4 },
    { label: "提交初稿（至少 150 字）", points: draftDone ? 5 : 0, max: 5 },
    { label: "完成自我检查清单", points: checkDone ? 3 : 0, max: 3 },
    { label: "提交有实质修改的修改稿", points: revDone ? 3 : 0, max: 3 },
    { label: "写下自我反思（至少 30 字）", points: refDone ? 2 : 0, max: 2 },
  ];
  return { total: rows.reduce((n, r) => n + r.points, 0), rows };
}
