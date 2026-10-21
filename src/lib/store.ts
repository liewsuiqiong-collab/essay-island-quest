// 本地持久化存储（localStorage）。
// 所有读写都集中在这里：以后接入云端数据库时，只需替换本文件的实现。
import { useSyncExternalStore } from "react";
import type { EssayPrompt, EssayType } from "./content";

export type Skill = "审题" | "构思" | "描写" | "词句" | "修改";

export interface PlotPlan {
  id: string;
  title: string;
  mode: "narrative" | "peel";
  fields: Record<string, string>;
  updatedAt: string;
}

export interface Essay {
  id: string;
  promptId: string;
  title: string;
  type: EssayType;
  audit: { keywords: string; people: string; event: string; requirement: string };
  plan: Record<string, string>;
  draft: string;
  revision: string;
  checklist: string[];
  reflection: string;
  status: "构思中" | "初稿已提交" | "修改稿已提交";
  teacherComment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DescRecord {
  id: string;
  challengeId: string;
  original: string;
  rewrite: string;
  skills: string[];
  date: string;
}

export interface State {
  name: string;
  className: string;
  chineseTrack: "express" | "higher";
  xp: number;
  awarded: string[];
  badges: string[];
  skills: Record<Skill, number>;
  plans: PlotPlan[];
  essays: Essay[];
  descs: DescRecord[];
  log: { text: string; xp: number; date: string }[];
  customPrompts: EssayPrompt[];
  stats: { auditWrong: Record<string, number>; quizWrong: Record<string, number> };
  classNotes: string[];
}

const KEY = "zuowen-island-v1";

const initial: State = {
  name: "同学",
  className: "",
  chineseTrack: "express",
  xp: 0,
  awarded: [],
  badges: [],
  skills: { 审题: 0, 构思: 0, 描写: 0, 词句: 0, 修改: 0 },
  plans: [],
  essays: [],
  descs: [],
  log: [],
  customPrompts: [],
  stats: { auditWrong: {}, quizWrong: {} },
  classNotes: [],
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}

function set(fn: (s: State) => State) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      load();
      return state;
    },
    () => initial,
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const now = () => new Date().toISOString();
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("zh-SG", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

/* ---------- 等级与徽章 ---------- */
export const LEVELS = ["写作新手", "文字学徒", "故事旅人", "描写能手", "作文探险家", "文采达人", "冒险岛岛主"];
export function levelInfo(xp: number) {
  const lv = Math.min(Math.floor(xp / 150), LEVELS.length - 1);
  const into = xp - lv * 150;
  return { lv: lv + 1, title: LEVELS[lv], pct: lv === LEVELS.length - 1 ? 100 : Math.round((into / 150) * 100), next: 150 - into };
}

export const BADGES: Record<string, { name: string; desc: string; icon: string }> = {
  audit: { name: "审题侦探", desc: "完成一套审题关卡", icon: "🔍" },
  plot: { name: "情节设计师", desc: "保存一份完整构思", icon: "🗺️" },
  describe: { name: "描写魔法师", desc: "完成两个描写挑战", icon: "✨" },
  words: { name: "词句工匠", desc: "词句测验答对 6 题以上", icon: "🧩" },
  challenge: { name: "作文挑战者", desc: "提交一篇初稿", icon: "🏆" },
  reviser: { name: "认真修改家", desc: "提交一篇有实质修改的修改稿", icon: "🔧" },
  reflector: { name: "反思之星", desc: "写下一段认真的自我反思", icon: "🌟" },
};

/** 一次性奖励：同一个 key 只发一次 XP，防止重复刷分 */
export function award(key: string, xp: number, text: string, skill?: Skill) {
  set((s) => {
    if (s.awarded.includes(key)) return s;
    return {
      ...s,
      xp: s.xp + xp,
      awarded: [...s.awarded, key],
      skills: skill ? { ...s.skills, [skill]: s.skills[skill] + 1 } : s.skills,
      log: [{ text, xp, date: now() }, ...s.log].slice(0, 50),
    };
  });
}
export const hasAward = (s: State, key: string) => s.awarded.includes(key);

export function giveBadge(id: string) {
  set((s) => (s.badges.includes(id) ? s : { ...s, badges: [...s.badges, id] }));
}

export function setName(name: string) {
  set((s) => ({ ...s, name }));
}

export function setPlayerDetails(details: Partial<Pick<State, "className" | "chineseTrack">>) {
  set((s) => ({ ...s, ...details }));
}

/* ---------- 构思 ---------- */
export function savePlan(p: PlotPlan) {
  set((s) => ({ ...s, plans: [p, ...s.plans.filter((x) => x.id !== p.id)] }));
}
export function deletePlan(id: string) {
  set((s) => ({ ...s, plans: s.plans.filter((x) => x.id !== id) }));
}

/* ---------- 作文 ---------- */
export function upsertEssay(e: Essay) {
  set((s) => ({ ...s, essays: [{ ...e, updatedAt: now() }, ...s.essays.filter((x) => x.id !== e.id)] }));
}
export function deleteEssay(id: string) {
  set((s) => ({ ...s, essays: s.essays.filter((x) => x.id !== id) }));
}
export function setTeacherComment(id: string, comment: string) {
  set((s) => ({ ...s, essays: s.essays.map((e) => (e.id === id ? { ...e, teacherComment: comment } : e)) }));
}

/* ---------- 描写 ---------- */
export function addDesc(d: DescRecord) {
  set((s) => ({ ...s, descs: [d, ...s.descs] }));
}

/* ---------- 统计 ---------- */
export function recordWrong(kind: "auditWrong" | "quizWrong", id: string) {
  set((s) => ({ ...s, stats: { ...s.stats, [kind]: { ...s.stats[kind], [id]: (s.stats[kind][id] ?? 0) + 1 } } }));
}

/* ---------- 教师 ---------- */
export function addCustomPrompt(p: EssayPrompt) {
  set((s) => ({ ...s, customPrompts: [...s.customPrompts, p] }));
}
export function removeCustomPrompt(id: string) {
  set((s) => ({ ...s, customPrompts: s.customPrompts.filter((p) => p.id !== id) }));
}
export function addClassNote(n: string) {
  set((s) => ({ ...s, classNotes: [...s.classNotes, n] }));
}
export function removeClassNote(i: number) {
  set((s) => ({ ...s, classNotes: s.classNotes.filter((_, j) => j !== i) }));
}

export function resetAll() {
  set(() => initial);
}

/** 统计中文字数（汉字 + 中文标点不计） */
export const countChars = (t: string) => (t.match(/[\u4e00-\u9fff]/g) ?? []).length;
