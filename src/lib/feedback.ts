// 规则式反馈（不是 AI）：根据关键词、长度、标点等可解释的规则给出建议。
import { DESC_KEYWORDS, type DescSkill } from "./content";
import { countChars } from "./store";

export function analyzeDescription(text: string, banned: string[]) {
  const found = (Object.keys(DESC_KEYWORDS) as DescSkill[]).filter((k) => DESC_KEYWORDS[k].some((w) => text.includes(w)));
  const chars = countChars(text);
  const usedBanned = banned.filter((b) => text.includes(b));
  const tips: string[] = [];
  if (chars < 25) tips.push(`目前只有 ${chars} 个字，试着写到 25 字以上，把画面展开。`);
  if (usedBanned.length) tips.push(`你仍直接写了「${usedBanned.join("、")}」。试着用细节「展示」，而不是直接「告诉」。`);
  if (found.length < 2) tips.push("目前用到的描写手法少于 2 种，可以参考下方分层提示再加一种。");
  if (!/[。！？…]$/.test(text.trim())) tips.push("记得用句号、感叹号等标点结束句子。");
  const pass = chars >= 25 && found.length >= 2 && usedBanned.length === 0;
  return { found, chars, tips, pass };
}

export function checkSentence(word: string, s: string) {
  const tips: string[] = [];
  if (!s.includes(word)) tips.push(`句子里要包含「${word}」。`);
  if (countChars(s) < 10) tips.push("句子太短了，加入人物、时间或原因，至少 10 个字。");
  if (!/[。！？]$/.test(s.trim())) tips.push("句末要加标点。");
  if (s.includes(word + word)) tips.push("词语重复了。");
  return { pass: tips.length === 0, tips };
}

/** 粗略计算两段文字差异的字数（基于最长公共子序列），用于判断是否「认真修改」 */
export function changedChars(a: string, b: string) {
  const x = [...a.slice(0, 1500)], y = [...b.slice(0, 1500)];
  let prev = new Array(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i++) {
    const cur = new Array(y.length + 1).fill(0);
    for (let j = 1; j <= y.length; j++) cur[j] = x[i - 1] === y[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    prev = cur;
  }
  const lcs = prev[y.length];
  return x.length - lcs + (y.length - lcs);
}

export function essayHints(type: "narrative" | "opinion", text: string) {
  const tips: string[] = [];
  const n = countChars(text);
  const paras = text.split(/\n+/).filter((p) => p.trim()).length;
  if (n < 300) tips.push(`目前约 ${n} 字。中二作文一般建议 500 字以上。`);
  if (paras < 3) tips.push(`目前只有 ${paras} 段，建议分段，让结构更清楚。`);
  if (type === "narrative") {
    const skills = (Object.keys(DESC_KEYWORDS) as DescSkill[]).filter((k) => DESC_KEYWORDS[k].some((w) => text.includes(w)));
    if (skills.length < 3) tips.push(`检测到的描写手法：${skills.join("、") || "无"}。高潮处可加入更多动作、神态、心理描写。`);
    if (!/(学到|明白|懂得|教训|领悟|从此|以后)/.test(text)) tips.push("没有找到「学到 / 明白 / 教训」等感悟词，记得在结尾写出反思。");
  } else {
    if (!/(我同意|我不同意|我认为|我觉得)/.test(text.slice(0, 120))) tips.push("开头 120 字内没有找到明确立场句（如「我同意」「我认为」）。");
    if (!/(例如|比如|举例|有一次|记得)/.test(text)) tips.push("没有找到「例如 / 有一次」等举例标志，观点需要生活例子支持。");
    if (!/(因此|所以|总之|综上所述|由此可见)/.test(text)) tips.push("可用「因此 / 总之」等词联系回观点与总结。");
  }
  return tips;
}
