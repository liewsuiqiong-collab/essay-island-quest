# 作文闯关岛 · 90分钟复习活动改造

- [x] 生成范文学习馆岛屿素材 museum-island.png
- [x] content.ts：范文标签（节选/摘要）、学习馆三组任务题库（结构侦探/表达升级/写作迁移）、挑战规划五栏
- [x] store.ts：scores（各站得分）、museumResults、setStationScore
- [x] lib/scores.ts：五站定义、解锁规则、总分/星星/鼓励语、challengeScore 可解释计分
- [x] 新路由 /museum 范文学习馆（作文提交后解锁）
- [x] 新路由 /report PDF 学习报告（window.print）
- [x] audit/words/describe/challenge 记录本站得分（每站 20 分）
- [x] AdventureMap 五岛 + 用时/满分/得分/完成/解锁状态；PlayerPanel 进度 /5 + 总分
- [x] index.tsx：90 分钟任务区、报告入口、清除本机进度
- [x] AppHeader：移除教师入口，加学习馆/报告
- [x] 删除 teacher.tsx；portfolio 移除教师评语区
- [x] styles.css 打印样式
- [x] vite.config 开启 SPA 静态输出（GitHub Pages 可部署）
- [x] 测试 + Playwright 端到端验证
