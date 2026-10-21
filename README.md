# Essay Island Quest

请创建一个名为「作文冒险岛」的中文游戏化作文学习平台，面向新加坡中二快捷华文与高级华文学生。请直接构建可运行的交互式 MVP，不要只给设计建议或静态原型。低成本优先，不接入付费 AI API，不调用 AI 自动代写作文。

设计：现代、活泼但不幼稚，清新蓝/薄荷绿/橙/紫配色，卡片布局、关卡地图、XP、徽章、进度条；简体中文；响应式适配电脑、平板和手机。

首页显示欢迎语、今日任务、XP、写作等级、已完成关卡、待加强技能和继续学习按钮。设置五个主要学习模块：
1.「审题侦探」：学生找出题目关键词、人物、事件、写作要求；练习判断切题/偏题/离题；先给提示而非直接显示答案。
2.「情节设计师」：可填写开端、发展、高潮、结局、反思的故事规划板，提供引导问题并能保存构思。
3.「描写魔法师」：普通句子升级挑战，练习动作、神态、心理、语言、环境描写。示例原句「我很紧张」，分层提示引导学生自行改写，展示修改前后对比。
4.「词语与句子工坊」：按人物心理、动作、神态、环境、情绪等分类词语；固定题库练习词语搭配、近义词、填空、造句和句子改写。
5.「作文挑战赛」：学生独立写作文，先审题和构思，再写作，使用自我检查清单，保存初稿、修改稿及反思。记叙文重点练情节、细节、人物刻画；观点题提供 PEEL（观点、解释、例子、联系）框架，不强迫所有文体使用同一模板。

提供「我的成长作品集」，可查看题目、构思、初稿、修改稿、自我反思、教师评语和日期。奖励包含 XP、关卡完成徽章、描写魔法师等技能徽章；积分应与完成练习和认真修改挂钩，不设置公开学生排行榜。

请内置至少 3 个可实际操作的中文示例练习，包括：
- 记叙文题目：「你代表学校参加一场比赛。比赛中却发生了一件令你感到十分尴尬的事情。试写出事情的经过以及你从中学到的教训。」
- 描写练习：把「我很紧张」改写得更具体。
- 观点练习：「你同意主动表达对父母的爱很重要吗？为什么？请举生活例子说明。」
题目应有明确反馈与答案解释，学生能重试。作文输入区域可编辑，提供保存草稿、提交练习、修改稿和自我反思功能。若未连接数据库，先以本地持久化方式实现原型，并明确说明本地数据不等于教师可跨设备查看的云端记录。

教师后台先制作界面与可操作的演示流程：练习管理、学生提交记录、教师评语、班级常见问题、CSV 导出入口。不要虚构真实学生数据。将教师后台与学生界面区分开。

技术要求：使用 Lovable 默认 TypeScript/Tailwind 技术栈，组件化，避免不必要依赖。第一阶段不要配置 Supabase 或付费 AI 服务；先让前端所有导航、按钮、表单、练习提交、反馈、进度和初稿/修改稿对比真实可操作。使用规则式反馈，绝不假装有 AI 批改。代码结构需方便以后添加 Supabase 登录、数据库和安全的教师/学生权限。

请优先完成一个精致、完整的第一阶段 MVP。完成后说明已实现功能、目前使用本地保存的部分，以及以后连接 Supabase 需要做什么。

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://essay-island-quest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/329e0533-753a-478a-aeb6-b8ceca861580).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
