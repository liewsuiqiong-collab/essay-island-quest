import { describe, expect, it } from "vitest";
import { CHALLENGE_PROMPTS, MUSEUM_TASKS, CHECKLISTS } from "@/lib/content";
import { challengeScore, stars, stationUnlocked, totalScore, STATIONS, TOTAL_MAX } from "@/lib/scores";
import type { Essay, State } from "@/lib/store";

const baseEssay: Essay = {
  id: "e1",
  promptId: "p-embarrass",
  title: "t",
  type: "narrative",
  audit: { keywords: "", people: "", event: "", requirement: "" },
  plan: {},
  draft: "",
  revision: "",
  checklist: [],
  reflection: "",
  status: "构思中",
  teacherComment: "",
  createdAt: "",
  updatedAt: "",
};

const fullEssay: Essay = {
  ...baseEssay,
  audit: { keywords: "比赛", people: "我们", event: "尴尬的事", requirement: "经过与启示" },
  plan: { opening: "开头", event: "事件", turning: "转折", feeling: "感受", ending: "启示" },
  draft: "我".repeat(200),
  revision: "我".repeat(150) + "改".repeat(60),
  checklist: [...CHECKLISTS.narrative],
  reflection: "反".repeat(35),
  status: "修改稿已提交",
};

describe("作文终极挑战计分（满分 20，按完成度）", () => {
  it("空白作文得 0 分", () => {
    const r = challengeScore(baseEssay);
    expect(r.total).toBe(0);
  });
  it("全部完成得 20 分", () => {
    const r = challengeScore(fullEssay);
    expect(r.total).toBe(20);
  });
  it("只提交初稿得 12 分（审题 3 + 规划 4 + 初稿 5，未完成项不计分）", () => {
    const e: Essay = { ...fullEssay, status: "初稿已提交", checklist: [], reflection: "", revision: fullEssay.draft };
    expect(challengeScore(e).total).toBe(3 + 4 + 5);
  });
});

describe("星星与总分", () => {
  it("星星门槛：90/70/40", () => {
    expect(stars(90)).toBe(3);
    expect(stars(70)).toBe(2);
    expect(stars(40)).toBe(1);
    expect(stars(39)).toBe(0);
  });
  it("五站满分合计 100", () => {
    expect(TOTAL_MAX).toBe(100);
    const s = { scores: Object.fromEntries(STATIONS.map((st) => [st.id, 20])) } as unknown as State;
    expect(totalScore(s)).toBe(100);
  });
});

describe("解锁规则", () => {
  const st = (scores: Record<string, number>) => ({ scores }) as unknown as State;
  it("第一站始终解锁，其余需完成前一站", () => {
    expect(stationUnlocked(st({}), "audit")).toBe(true);
    expect(stationUnlocked(st({}), "words")).toBe(false);
    expect(stationUnlocked(st({ audit: 20 }), "words")).toBe(true);
    expect(stationUnlocked(st({ audit: 20 }), "describe")).toBe(false);
  });
  it("终极挑战只需完成句子升级站（不等待学习馆）", () => {
    expect(stationUnlocked(st({ audit: 20, words: 20, describe: 20 }), "challenge")).toBe(true);
    expect(stationUnlocked(st({ audit: 20, words: 20 }), "challenge")).toBe(false);
  });
});

describe("范文学习馆题库", () => {
  it("每道挑战题都有完整的三组任务", () => {
    for (const p of CHALLENGE_PROMPTS) {
      const t = MUSEUM_TASKS[p.id];
      expect(t, p.id).toBeDefined();
      expect(t!.structure).toHaveLength(4);
      expect(t!.structure.map((x) => x.answer).sort()).toEqual([0, 1, 2, 3]);
      expect(t!.expression.options.length).toBeGreaterThanOrEqual(4);
      expect(t!.transfer.options[t!.transfer.answer]).toBeTruthy();
    }
  });
});
