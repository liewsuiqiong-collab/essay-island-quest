import { describe, expect, it } from "vitest";
import { CHALLENGE_PROMPTS, MODEL_ESSAYS } from "@/lib/content";

describe("参考范文", () => {
  it("作文挑战赛的每道题都至少有一篇范文", () => {
    for (const p of CHALLENGE_PROMPTS) {
      expect(MODEL_ESSAYS[p.id]?.length ?? 0, `题目 ${p.id} 缺少范文`).toBeGreaterThanOrEqual(1);
    }
  });

  it("每篇范文都有署名和足够长的正文", () => {
    for (const essays of Object.values(MODEL_ESSAYS)) {
      for (const m of essays) {
        expect(m.author.trim().length).toBeGreaterThan(0);
        expect(m.text.trim().length).toBeGreaterThanOrEqual(200);
      }
    }
  });
});
