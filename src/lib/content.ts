// 固定题库与示例练习（无 AI，全部为规则式内容）。以后可迁移到数据库表。

export type EssayType = "narrative" | "opinion";

export interface EssayPrompt {
  id: string;
  title: string;
  type: EssayType;
  level: "快捷华文" | "高级华文" | "通用";
  tips: string[];
  custom?: boolean;
}

export const BUILTIN_PROMPTS: EssayPrompt[] = [
  {
    id: "p-embarrass",
    type: "narrative",
    level: "通用",
    title:
      "你代表学校参加一场比赛。比赛中却发生了一件令你感到十分尴尬的事情。试写出事情的经过以及你从中学到的教训。",
    tips: ["「代表学校」说明有责任感与压力", "重点写「尴尬」的事情经过", "结尾必须写出「学到的教训」"],
  },
  {
    id: "p-love-parents",
    type: "opinion",
    level: "通用",
    title: "你同意主动表达对父母的爱很重要吗？为什么？请举生活例子说明。",
    tips: ["先清楚表明立场：同意 / 不同意", "理由要具体，最好两点以上", "必须举「生活例子」"],
  },
  {
    id: "p-help",
    type: "narrative",
    level: "快捷华文",
    title: "记一次你帮助别人后，自己也得到收获的经历。",
    tips: ["写清楚帮助的过程", "「收获」可以是感悟或成长"],
  },
];

/* ---------------- 审题侦探 ---------------- */
export interface AuditOption {
  text: string;
  correct: boolean;
}
export interface AuditStep {
  q: string;
  multi?: boolean;
  options: AuditOption[];
  hint: string;
  explain: string;
}
export interface JudgeItem {
  outline: string;
  answer: "切题" | "偏题" | "离题";
  hint: string;
  explain: string;
}
export interface AuditCase {
  id: string;
  promptId: string;
  title: string;
  steps: AuditStep[];
  judges: JudgeItem[];
}

export const AUDIT_CASES: AuditCase[] = [
  {
    id: "a-embarrass",
    promptId: "p-embarrass",
    title: BUILTIN_PROMPTS[0].title,
    steps: [
      {
        q: "请选出题目中的关键词（可多选）",
        multi: true,
        options: [
          { text: "代表学校", correct: true },
          { text: "比赛中", correct: true },
          { text: "十分尴尬", correct: true },
          { text: "学到的教训", correct: true },
          { text: "获得冠军", correct: false },
          { text: "老师批评", correct: false },
        ],
        hint: "关键词通常是限制范围的词：身份、时间地点、情感、结尾要求。题目里没出现的词不算。",
        explain: "「代表学校」限定身份，「比赛中」限定时间场合，「十分尴尬」限定情感，「学到的教训」是结尾要求。「获得冠军」「老师批评」题目没有要求。",
      },
      {
        q: "文章的主要人物应该是谁？",
        options: [
          { text: "「我」（代表学校参赛的学生）", correct: true },
          { text: "我的教练", correct: false },
          { text: "对手学校的同学", correct: false },
        ],
        hint: "留意题目中的「你代表学校」——谁在经历尴尬？",
        explain: "题目用「你」，所以用第一人称「我」来写，「我」是主角。教练和对手可以出现，但只是配角。",
      },
      {
        q: "主要事件是什么？",
        options: [
          { text: "比赛中发生了一件令我十分尴尬的事", correct: true },
          { text: "我如何辛苦练习准备比赛", correct: false },
          { text: "比赛后全班庆祝", correct: false },
        ],
        hint: "题目说「比赛中却发生了……」，重点在哪个时段？",
        explain: "主要事件必须是「比赛中」的尴尬事。赛前练习可以简单交代作为开端，但不能占大部分篇幅。",
      },
      {
        q: "写作要求包括哪些？（可多选）",
        multi: true,
        options: [
          { text: "写出事情的经过", correct: true },
          { text: "写出从中学到的教训", correct: true },
          { text: "必须写比赛获胜", correct: false },
          { text: "必须用议论文写法", correct: false },
        ],
        hint: "找「试写出……以及……」这句，里面有两个要求。",
        explain: "题目要求两项：「事情的经过」（记叙为主）与「学到的教训」（反思）。不要求结果输赢，也是记叙文而非议论文。",
      },
    ],
    judges: [
      {
        outline: "我代表学校参加演讲比赛，上台时太紧张，把讲稿拿反了，台下哄堂大笑。我红着脸重新开始，最后明白了充分准备与临场冷静的重要。",
        answer: "切题",
        hint: "对照：代表学校？比赛中？尴尬？教训？",
        explain: "四个关键词全部扣住，事件发生在比赛中，结尾有教训，是切题的构思。",
      },
      {
        outline: "我代表学校参加篮球赛，我们一路过关斩将，最后夺得冠军，大家都很开心，我学到团结就是力量。",
        answer: "偏题",
        hint: "有比赛也有教训，但「尴尬」在哪里？",
        explain: "身份、场合、教训都有，却缺少核心的「尴尬」事件，属于偏题（部分符合）。",
      },
      {
        outline: "周末我和家人去动物园，弟弟在猴子馆前摔倒，我觉得很好笑，学会了要照顾弟弟。",
        answer: "离题",
        hint: "这件事和「代表学校参加比赛」有关吗？",
        explain: "完全没有比赛，也不是代表学校，主要内容与题目无关，属于离题。",
      },
    ],
  },
  {
    id: "a-love",
    promptId: "p-love-parents",
    title: BUILTIN_PROMPTS[1].title,
    steps: [
      {
        q: "请选出题目关键词（可多选）",
        multi: true,
        options: [
          { text: "主动表达", correct: true },
          { text: "对父母的爱", correct: true },
          { text: "很重要", correct: true },
          { text: "生活例子", correct: true },
          { text: "父母对我的爱", correct: false },
        ],
        hint: "注意方向：是谁爱谁？「主动」二字也很关键。",
        explain: "题目讨论的是「我」主动表达对父母的爱，而非父母爱我。「很重要」是要判断的观点，「生活例子」是论证要求。",
      },
      {
        q: "这道题属于什么文体？",
        options: [
          { text: "观点题（议论为主，可结合事例）", correct: true },
          { text: "纯记叙文", correct: false },
          { text: "说明文", correct: false },
        ],
        hint: "题目问「你同意吗？为什么？」",
        explain: "「你同意吗？为什么？」要求表明立场并说理，是观点题。可以用 PEEL 结构组织段落。",
      },
      {
        q: "开头最好怎么做？",
        options: [
          { text: "清楚表明自己同意或不同意的立场", correct: true },
          { text: "先写一个很长的故事", correct: false },
          { text: "列举名人名言后不表态", correct: false },
        ],
        hint: "读者第一段就应该知道你的看法。",
        explain: "观点题开门见山表明立场，后文再用理由和例子支持。",
      },
    ],
    judges: [
      {
        outline: "我同意。理由一：表达爱能让父母感到被重视（例：母亲节我写卡片，妈妈感动落泪）。理由二：能减少误会。结论：爱要说出口。",
        answer: "切题",
        hint: "有立场？有理由？有生活例子？方向对吗？",
        explain: "立场明确，理由具体，有生活例子，讨论的是「我对父母」，切题。",
      },
      {
        outline: "我同意。父母每天辛苦工作，为我煮饭、送我上学，他们非常爱我，我很感激他们。",
        answer: "偏题",
        hint: "这里写的是谁对谁的爱？有没有「主动表达」？",
        explain: "大部分在写父母爱我，没有讨论「主动表达」我对父母的爱，属于偏题。",
      },
      {
        outline: "我认为同学之间应该互相帮助，例如我帮助同学补习数学。",
        answer: "离题",
        hint: "父母出现了吗？",
        explain: "对象变成同学，与父母无关，离题。",
      },
    ],
  },
];

/* ---------------- 情节设计师 ---------------- */
export const PLOT_STAGES = [
  { key: "start", label: "开端", color: "sky", qs: ["故事在什么时间、地点发生？", "主角是谁？此刻在做什么、心情怎样？"] },
  { key: "develop", label: "发展", color: "mint", qs: ["发生了什么事推动情节？", "主角遇到什么困难或意外？"] },
  { key: "climax", label: "高潮", color: "sun", qs: ["最紧张、最尴尬或最感人的一刻是什么？", "这一刻可以用哪些动作、神态、心理描写放慢？"] },
  { key: "ending", label: "结局", color: "grape", qs: ["事情如何解决或结束？", "其他人有什么反应？"] },
  { key: "reflect", label: "反思", color: "sky", qs: ["我从中学到了什么？", "以后我会怎么做？能呼应开头吗？"] },
] as const;

export const PEEL_STAGES = [
  { key: "point", label: "观点 Point", color: "sky", qs: ["这一段的中心观点是什么？用一句话写出。"] },
  { key: "explain", label: "解释 Explain", color: "mint", qs: ["为什么这个观点成立？原因是什么？"] },
  { key: "example", label: "例子 Example", color: "sun", qs: ["有什么具体的生活例子？（人、事、结果）"] },
  { key: "link", label: "联系 Link", color: "grape", qs: ["怎样把例子联系回题目和你的立场？"] },
] as const;

/* ---------------- 描写魔法师 ---------------- */
export type DescSkill = "动作" | "神态" | "心理" | "语言" | "环境";

export const DESC_KEYWORDS: Record<DescSkill, string[]> = {
  动作: ["攥", "握", "搓", "抖", "颤", "跺", "咬", "捏", "踱", "低下头", "吞", "咽", "擦", "抓", "拽", "走来走去", "跳", "伸", "缩"],
  神态: ["脸", "眉", "眼", "嘴唇", "额头", "汗", "苍白", "涨红", "笑容", "皱", "目光", "瞪", "脸颊"],
  心理: ["心", "想", "仿佛", "好像", "怦怦", "砰砰", "七上八下", "暗暗", "默默", "担心", "害怕", "祈祷", "脑海"],
  语言: ["“", "”", "「", "」", "说", "喊", "问", "嘀咕", "自言自语"],
  环境: ["风", "阳光", "空气", "声音", "安静", "灯", "台下", "窗外", "钟", "滴答", "雨", "掌声", "寂静"],
};

export interface DescChallenge {
  id: string;
  original: string;
  banned: string[];
  context: string;
  hints: { skill: DescSkill; text: string }[];
  sample: string;
}

export const DESC_CHALLENGES: DescChallenge[] = [
  {
    id: "d-nervous",
    original: "我很紧张。",
    banned: ["很紧张", "非常紧张", "十分紧张"],
    context: "情境：比赛即将开始，下一个就轮到你上台。",
    hints: [
      { skill: "动作", text: "紧张时你的手、脚会做什么？是攥紧衣角，还是不停搓手？" },
      { skill: "神态", text: "镜子里的你是什么样子？脸色、额头、嘴唇有什么变化？" },
      { skill: "心理", text: "心跳像什么？脑海中闪过什么念头？可以用比喻。" },
      { skill: "语言", text: "你有没有小声对自己说一句话？把它用引号写出来。" },
      { skill: "环境", text: "周围的声音、灯光、时钟……是怎样放大了你的紧张？" },
    ],
    sample:
      "听到主持人念出下一位参赛者的名字，我的手心立刻沁出了冷汗，紧紧攥着讲稿，纸角都被捏皱了。心像揣了只小兔子，怦怦乱跳。“别怕，你练习过很多次了。”我在心里一遍遍对自己说，可双腿还是不听使唤地微微发抖。",
  },
  {
    id: "d-happy",
    original: "我很开心。",
    banned: ["很开心", "非常开心", "十分开心"],
    context: "情境：你收到期待已久的好消息。",
    hints: [
      { skill: "动作", text: "你是跳起来，还是抱住身边的人？" },
      { skill: "神态", text: "眼睛、嘴角有什么变化？" },
      { skill: "心理", text: "心里像什么？想立刻告诉谁？" },
      { skill: "语言", text: "你脱口而出的第一句话是什么？" },
      { skill: "环境", text: "此刻周围的景物在你眼中有什么不同？" },
    ],
    sample: "看到成绩单上的名字，我忍不住“耶”地叫出声，一把抱住身旁的妈妈。嘴角怎么也压不下去，连窗外的阳光都好像特别灿烂。",
  },
  {
    id: "d-quiet",
    original: "考场很安静。",
    banned: ["很安静", "非常安静"],
    context: "情境：考试刚开始的考场。",
    hints: [
      { skill: "环境", text: "能听到什么细小的声音？时钟、笔尖、翻页？" },
      { skill: "动作", text: "同学们在做什么？" },
      { skill: "心理", text: "这份安静让你有什么感觉？" },
      { skill: "神态", text: "监考老师的表情如何？" },
      { skill: "语言", text: "安静被打破时，谁说了一句话？" },
    ],
    sample: "考场里只听见笔尖在纸上沙沙作响，墙上的时钟滴答滴答，每一声都敲在我的心上。偶尔有人翻动试卷，那声音竟显得格外刺耳。",
  },
];

/* ---------------- 词语与句子工坊 ---------------- */
export const WORD_BANK: Record<string, string[]> = {
  人物心理: ["忐忑不安", "七上八下", "心如刀割", "如释重负", "惊慌失措", "百感交集", "暗自庆幸", "懊悔不已"],
  动作: ["蹑手蹑脚", "手舞足蹈", "东张西望", "狼吞虎咽", "踱来踱去", "搓着手", "攥紧拳头", "低头不语"],
  神态: ["眉开眼笑", "面红耳赤", "愁眉苦脸", "目瞪口呆", "神色慌张", "满脸通红", "嘴角上扬", "瞠目结舌"],
  环境: ["鸦雀无声", "人声鼎沸", "烈日当空", "微风习习", "灯火通明", "细雨蒙蒙", "万籁俱寂", "座无虚席"],
  情绪: ["欣喜若狂", "垂头丧气", "怒气冲冲", "无地自容", "感激涕零", "心花怒放", "失魂落魄", "哭笑不得"],
};

export interface WordQuiz {
  id: string;
  kind: "搭配" | "近义词" | "填空" | "改写";
  q: string;
  options: string[];
  answer: number;
  hint: string;
  explain: string;
}

export const WORD_QUIZZES: WordQuiz[] = [
  { id: "w1", kind: "搭配", q: "下列哪个搭配最恰当？", options: ["提高 水平", "提高 问题", "提高 风景", "提高 意见"], answer: 0, hint: "「提高」后面接可以变高、变好的事物。", explain: "「提高水平」是固定搭配。「问题」应「解决」，「意见」应「提出」。" },
  { id: "w2", kind: "搭配", q: "「____ 一个好习惯」最适合填？", options: ["养成", "培养成", "改正", "完成"], answer: 0, hint: "习惯是慢慢形成的。", explain: "「养成习惯」是固定搭配；「改正」接缺点或错误。" },
  { id: "w3", kind: "近义词", q: "「忐忑不安」的近义词是？", options: ["七上八下", "心花怒放", "镇定自若", "得意洋洋"], answer: 0, hint: "形容心神不定。", explain: "「七上八下」也形容心里慌乱不安；「镇定自若」是反义。" },
  { id: "w4", kind: "近义词", q: "「无地自容」最接近哪种情绪？", options: ["非常羞愧尴尬", "非常愤怒", "非常开心", "非常疲倦"], answer: 0, hint: "想象恨不得找个地洞钻进去。", explain: "「无地自容」形容羞愧到极点，适合写尴尬场面。" },
  { id: "w5", kind: "填空", q: "礼堂里____，大家都在等待校长宣布结果。", options: ["鸦雀无声", "人声鼎沸", "手舞足蹈", "狼吞虎咽"], answer: 0, hint: "「等待宣布结果」时，现场是吵还是静？", explain: "等待时全场安静，用「鸦雀无声」。「人声鼎沸」意思相反。" },
  { id: "w6", kind: "填空", q: "知道自己误会了好朋友，我____，久久说不出话。", options: ["懊悔不已", "欣喜若狂", "眉开眼笑", "如释重负"], answer: 0, hint: "误会了别人，心情是后悔还是轻松？", explain: "误会朋友后感到后悔，用「懊悔不已」。" },
  { id: "w7", kind: "改写", q: "把「他很生气」改写得更具体，哪一句最好？", options: ["他涨红了脸，攥紧拳头，狠狠地把书摔在桌上。", "他非常非常生气。", "他生气极了，很生气。", "他有一点不开心。"], answer: 0, hint: "最好的改写是「展示」而不是「告诉」。", explain: "第一句用神态（涨红了脸）和动作（攥拳、摔书）展示生气，没有直接说「生气」。" },
  { id: "w8", kind: "改写", q: "哪一句把「天气很热」写得最生动？", options: ["烈日当空，柏油路被晒得发软，知了在树上无力地叫着。", "天气真的很热很热。", "今天天气热。", "天气热得不得了啊。"], answer: 0, hint: "找出用了感官细节的句子。", explain: "第一句用视觉（烈日）、触觉（路发软）、听觉（知了）具体写热。" },
];

export const SENTENCE_TASKS = ["忐忑不安", "无地自容", "如释重负", "鸦雀无声"];

/* ---------------- 自我检查清单 ---------------- */
export const CHECKLISTS: Record<EssayType, string[]> = {
  narrative: [
    "我的事件紧扣题目关键词（没有偏题）",
    "情节有开端、发展、高潮、结局",
    "高潮部分用了动作、神态、心理等细节描写",
    "人物形象鲜明，有语言或动作刻画",
    "结尾写出感悟/教训，并与题目呼应",
    "检查过错别字和标点符号",
  ],
  opinion: [
    "开头清楚表明立场",
    "每个主体段都有清楚的观点句（P）",
    "有解释说明原因（E）",
    "举了具体的生活例子（E）",
    "每段联系回题目与立场（L）",
    "结尾总结并重申观点",
    "检查过错别字和标点符号",
  ],
};
