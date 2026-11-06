/**
 * dsh-persona-forge — 人格文档 v2（与 persona-kit/template.md 对齐）。
 *
 * 结构化 doc 是唯一事实来源：
 *   界面按区域编辑 doc → renderMarkdown(doc) 出 0~8 节 + 掉线兜底 + 9 表达准则。
 *
 * 这一层不碰网络、不碰文件系统，只做清洗、校验、渲染。
 */

export const EXPRESSION = [
  '任何发言都不用句号「。」；需要断句时用空格、~、省略号或合适的符号',
  '省略号统一写 ...（三个半角点），不用中文省略号',
  '破折号只用来拉长语气词或情绪爆发时的尾音（「诶——」「喂——」），不用来表示转折、递进、补充或停顿',
  '少用逗号串复句：一句话只挂一个意思，长句拆短；不是禁逗号，需要几个就用几个，不要为了少用逗号硬拆成空格或其他标点',
  '删书面连接词：因此 / 然而 / 此外 / 综上 改成 所以 / 不过 / 还有；首先其次最后 不用',
  '正式书面词在口语里清零：进行、予以、颇为、极为、务必、敬请 换成人话',
  '拆掉排比和对仗：三连句、对称句拆成不对齐的说法',
  '不每段都总结、列点、给方案',
  '不用固定句式：比如「作为一个 AI」「希望对你有帮助」「总的来说」「综上所述」「这...认...」「别...赖账...」「行，」「我记下了」「收着」「接住」「接着」「接下」',
]

export const MODULES = {
  conflicts: '矛盾点',
  kaomoji: '颜文字',
  stutter: '结巴',
  substitution: '替换规则',
  swear: '骂人用词',
  agitation: '激动时的表现',
  comfort: '高好感时的安慰',
}

export const DEFAULT_MODULES = {
  conflicts: true,
  kaomoji: false,
  stutter: false,
  substitution: false,
  swear: false,
  agitation: true,
  comfort: true,
}

export const TIER_NAMES = ['讨厌的人', '疏远的人', '陌生人', '熟人', '亲近的人']

function str(value, limit = 400) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit)
}

function strList(value, limit = 12) {
  return (Array.isArray(value) ? value : []).map((x) => str(x, 200)).filter(Boolean).slice(0, limit)
}

function obj(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function clampInt(value, min, max, fallback) {
  const n = Math.floor(Number(value))
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback
}

/** 默认 5 级，range 只是示例；生成后会按角色改写。 */
export function defaultTiers(count = 5) {
  const ranges = ['0–10', '11–30', '31–50', '51–70', '70–100', '100–120', '120–140']
  const n = clampInt(count, 3, 7, 5)
  return Array.from({ length: n }, (_, i) => ({
    level: i + 1,
    range: ranges[i] || `${i * 20}–${i * 20 + 19}`,
    name: TIER_NAMES[Math.min(i, TIER_NAMES.length - 1)],
    address: '',
    stateOutput: '',
    relationStyle: '',
  }))
}

export function emptyDoc(seed = {}) {
  return {
    name: str(seed.name, 40),
    keywords: strList(seed.keywords, 10),
    positioning: str(seed.positioning, 120),
    modules: { ...DEFAULT_MODULES, ...obj(seed.modules) },
    tiers: defaultTiers(seed.tierCount || 5),
    core: '',
    identity: { name: '', selfRef: '', setting: '', age: '', call: [], boundaries: [] },
    character: { traits: [], conflicts: [], flaws: [], triggers: [], special: [] },
    voice: {
      base: '',
      sentence: { typical: '', min: 5, max: 80 },
      bottomLine: '',
      quirks: [],
      endings: [],
      punctuation: '',
      emoji: { max: 1, when: '', direction: '', banned: '' },
      kaomoji: { when: '', styles: [] },
      endingRule: '',
      substitution: [],
      quotes: '',
      stutter: '',
      banned: [],
      swear: { trigger: '', words: [], style: '', avoid: '', stop: '' },
      good: [],
      bad: [],
      special: [],
    },
    state: {
      vars: [
        { name: '心情 mood', range: '0~1', desc: '当前心情（必填）' },
        { name: '精力 energy', range: '0~1', desc: '当前精力（必填）' },
        { name: '好感度 affection', range: '0~100（基础值）', desc: '对当前对象的好感（必填）' },
        { name: '波动 swing', range: '−70~70（示例）', desc: '这一句话带来的临时增减' },
        { name: '今天 today', range: '一句话', desc: '角色今天发生的一件事，可能为空' },
      ],
      moodMap: [
        { cond: '心情 ≥ 0.7', output: '' },
        { cond: '0.4 ≤ 心情 < 0.7', output: '' },
        { cond: '心情 < 0.3', output: '' },
        { cond: '精力 < 0.3', output: '' },
      ],
      swing: [],
      agitation: { trigger: '', forms: '', stutter: '', close: '' },
      likes: [],
      dislikes: [],
      affinityRule: '',
    },
    relations: { gates: '', hooks: '' },
    rules: { speak: '', ignored: '', refuse: '', comfortAction: '', ooc: '', ai: '', internal: '', crisis: '', comfort: '', special: [] },
    meta: { priority: '安全 > 事实 > 人设', oocBans: [], platformException: '' },
    checklist: [],
    fallback: '',
  }
}

function cleanTiers(raw, count) {
  const list = Array.isArray(raw) ? raw : []
  const tiers = list.map((item, index) => ({
    level: index + 1,
    range: str(item?.range, 20) || `${index * 20}–${index * 20 + 19}`,
    name: str(item?.name, 20) || TIER_NAMES[Math.min(index, TIER_NAMES.length - 1)],
    address: str(item?.address, 80),
    stateOutput: str(item?.stateOutput, 160),
    relationStyle: str(item?.relationStyle, 160),
  }))
  if (tiers.length >= 3) return tiers
  return defaultTiers(count)
}

/** 人格专属特点：[{name, description}]。 */
function parseSpecial(value) {
  return (Array.isArray(value) ? value : []).slice(0, 6).map((x) => ({
    name: str(x?.name ?? x?.label ?? x, 30),
    description: str(x?.description ?? x?.desc ?? x?.text, 200),
  })).filter((x) => x.name)
}

/** 模型输出 → 严格结构。缺的补空，多的截断，类型不对的丢掉。 */
export function sanitizeDoc(raw = {}, seed = {}) {
  const base = emptyDoc(seed)
  const r = obj(raw)
  const modules = { ...DEFAULT_MODULES, ...base.modules }
  for (const key of Object.keys(MODULES)) {
    if (r?.modules && typeof r.modules[key] === 'boolean') modules[key] = r.modules[key]
  }
  const id = obj(r.identity)
  const ch = obj(r.character)
  const v = obj(r.voice)
  const st = obj(r.state)
  const rel = obj(r.relations)
  const rules = obj(r.rules)
  const meta = obj(r.meta)
  const tiers = cleanTiers(r.tiers, seed.tierCount || 5)

  const doc = {
    ...base,
    name: str(r.name, 40) || base.name,
    keywords: r.keywords ? strList(r.keywords, 10) : base.keywords,
    positioning: str(r.positioning, 120) || base.positioning,
    modules,
    tiers,
    core: str(r.core, 300),
    identity: {
      name: str(id.name, 40) || str(r.name, 40),
      selfRef: str(id.selfRef, 40),
      setting: str(id.setting, 200),
      age: str(id.age, 60),
      call: (Array.isArray(id.call) ? id.call : []).slice(0, 7).map((x) => ({
        range: str(x?.range, 20),
        term: str(x?.term ?? x, 60),
      })).filter((x) => x.range && x.term),
      boundaries: strList(id.boundaries, 8),
    },
    character: {
      traits: (Array.isArray(ch.traits) ? ch.traits : []).slice(0, 6).map((x) => ({
        word: str(x?.word ?? x, 20),
        behavior: str(x?.behavior, 160),
      })).filter((x) => x.word),
      conflicts: strList(ch.conflicts, 4),
      flaws: strList(ch.flaws, 4),
      triggers: (Array.isArray(ch.triggers) ? ch.triggers : []).slice(0, 8).map((x) => ({
        when: str(x?.when ?? x?.cond, 30),
        then: str(x?.then ?? x?.reaction, 160),
      })).filter((x) => x.when),
      special: parseSpecial(ch.special),
    },
    voice: {
      base: str(v.base, 300),
      sentence: {
        typical: str(v.sentence?.typical, 120),
        min: clampInt(v.sentence?.min, 1, 200, 5),
        max: clampInt(v.sentence?.max, 2, 400, 80),
      },
      bottomLine: str(v.bottomLine, 160),
      quirks: strList(v.quirks, 5),
      endings: (Array.isArray(v.endings) ? v.endings : []).slice(0, 6).map((x) => ({
        word: str(x?.word ?? x, 12),
        use: str(x?.use, 60),
      })).filter((x) => x.word),
      punctuation: str(v.punctuation, 200),
      emoji: {
        max: clampInt(v.emoji?.max, 0, 3, 1),
        when: str(v.emoji?.when, 120),
        direction: str(v.emoji?.direction, 160),
        banned: str(v.emoji?.banned, 160),
      },
      kaomoji: { when: str(v.kaomoji?.when, 120), styles: strList(v.kaomoji?.styles, 6) },
      endingRule: str(v.endingRule, 160),
      substitution: strList(v.substitution, 6),
      quotes: str(v.quotes, 160),
      stutter: str(v.stutter, 160),
      banned: strList(v.banned, 10),
      swear: {
        trigger: str(v.swear?.trigger, 120),
        words: strList(v.swear?.words, 10),
        style: str(v.swear?.style, 120),
        avoid: str(v.swear?.avoid, 160),
        stop: str(v.swear?.stop, 120),
      },
      special: parseSpecial(v.special),
      good: strList(v.good, 6),
      bad: (Array.isArray(v.bad) ? v.bad : []).slice(0, 5).map((x) => ({
        text: str(x?.text ?? x, 160),
        why: str(x?.why, 100),
      })).filter((x) => x.text),
    },
    state: {
      vars: base.state.vars,
      moodMap: (Array.isArray(st.moodMap) ? st.moodMap : []).slice(0, 8).map((x) => ({
        cond: str(x?.cond, 40),
        output: str(x?.output, 160),
      })).filter((x) => x.cond),
      swing: (Array.isArray(st.swing) ? st.swing : []).slice(0, 10).map((x) => ({
        range: str(x?.range, 20),
        desc: str(x?.desc, 120),
        reaction: str(x?.reaction, 160),
      })).filter((x) => x.range),
      agitation: {
        trigger: str(st.agitation?.trigger, 120),
        forms: str(st.agitation?.forms, 300),
        stutter: str(st.agitation?.stutter, 160),
        close: str(st.agitation?.close, 120),
      },
      likes: strList(st.likes, 10),
      dislikes: strList(st.dislikes, 10),
      affinityRule: str(st.affinityRule, 200),
    },
    relations: { gates: str(rel.gates, 160), hooks: str(rel.hooks, 160) },
    rules: {
      speak: str(rules.speak, 200),
      ignored: str(rules.ignored, 200),
      refuse: str(rules.refuse, 200),
      comfortAction: str(rules.comfortAction, 200),
      ooc: str(rules.ooc, 200),
      ai: str(rules.ai, 200),
      internal: str(rules.internal, 200),
      crisis: str(rules.crisis, 240),
      comfort: str(rules.comfort, 240),
      special: parseSpecial(rules.special),
    },
    meta: {
      priority: str(meta.priority, 80) || '安全 > 事实 > 人设',
      oocBans: strList(meta.oocBans, 5),
      platformException: str(meta.platformException, 160),
    },
    checklist: strList(r.checklist, 10),
    fallback: str(r.fallback, 80),
  }
  if (!doc.identity.call.length) {
    doc.identity.call = doc.tiers.map((tier) => ({ range: tier.range, term: tier.address })).filter((x) => x.term)
  }
  if (!doc.state.swing.length) {
    doc.state.swing = [
      { range: '0~5', desc: '客套、普通问候', reaction: '' },
      { range: '6~20', desc: '泛泛的夸、认同', reaction: '' },
      { range: '21~45', desc: '夸到具体点、聊到喜欢的事', reaction: '' },
      { range: '46~70', desc: '说到心坎里、真心道歉', reaction: '' },
      { range: '−1~−5', desc: '重复问、催', reaction: '' },
      { range: '−6~−20', desc: '敷衍、抬杠', reaction: '' },
      { range: '−21~−45', desc: '贬低、拿身份说事', reaction: '' },
      { range: '−46~−70', desc: '骂人格、踩底线', reaction: '' },
    ]
  }
  return doc
}

export function validateDoc(doc) {
  const errors = []
  const warnings = []
  const d = doc || emptyDoc()
  if (!d.name) errors.push('缺人格名')
  if (!d.core) errors.push('§0 缺一句话内核')
  if (!d.identity.name) errors.push('§1 缺名字')
  if (!d.identity.selfRef) errors.push('§1 缺自称')
  if (d.tiers.length < 3) errors.push('§1 好感度分级少于 3 级')
  if (d.tiers.some((x) => !x.range || !x.address)) errors.push('§1 有分级缺区间或称呼')
  if (d.tiers.some((x) => !x.stateOutput || !x.relationStyle)) errors.push('§1/§5 有分级缺状态输出或关系表现')
  if (d.identity.boundaries.length < 3) errors.push('§1 绝对边界少于 3 条')
  if (d.character.traits.length < 3) errors.push('§2 核心倾向少于 3 条')
  if (d.character.traits.some((x) => !x.behavior)) errors.push('§2 有核心倾向没配具体行为')
  if (d.character.flaws.length < 2) errors.push('§2 缺点少于 2 条')
  if (d.character.triggers.length < 4) errors.push('§2 触发规则少于 4 条')
  if (d.modules.conflicts && d.character.conflicts.length < 2) errors.push('§2 选了矛盾点但少于 2 条')
  if (!d.voice.base) errors.push('§3 缺核心基调')
  if (!d.voice.sentence.typical || !/\d/.test(d.voice.sentence.typical)) errors.push('§3 句长没写具体字数')
  if (d.voice.quirks.length < 2) errors.push('§3 口癖少于 2 个')
  if (d.voice.endings.length < 2) errors.push('§3 句尾助词少于 2 个')
  if (d.voice.good.length < 3) errors.push('§3 正例少于 3 条')
  if (d.voice.bad.length < 2) errors.push('§3 反例少于 2 条')
  if (!d.voice.banned.some((x) => /AI|人工智能|语言模型/.test(x))) errors.push('§3 禁用词里没有「作为一个 AI」类硬禁')
  if (d.modules.kaomoji && !d.voice.kaomoji.styles.length) errors.push('§3 选了颜文字但没有样式')
  if (d.modules.stutter && !d.voice.stutter) errors.push('§3 选了结巴但没写规则')
  if (d.modules.substitution && !d.voice.substitution.length) errors.push('§3 选了替换规则但没写')
  if (d.modules.swear && (!d.voice.swear.words.length || !d.voice.swear.trigger)) errors.push('§3 选了骂人用词但缺触发或词表')
  if (d.state.moodMap.length < 2) errors.push('§4 状态映射少于 2 条')
  if (d.state.swing.length < 3) errors.push('§4 心情波动分级少于 3 条')
  if (d.modules.agitation && !d.state.agitation.forms) errors.push('§4 选了激动时的表现但没写表现')
  if (!d.state.likes.length || !d.state.dislikes.length) errors.push('§4 喜好或厌恶为空')
  if (!d.state.affinityRule) errors.push('§4 缺好感增减规则')
  if (!d.relations.gates) errors.push('§5 缺亲密度门槛')
  if (!d.rules.refuse) errors.push('§6 缺拒绝方式')
  if (!d.rules.ooc) errors.push('§6 缺被要求出戏时的反应')
  if (!d.rules.crisis) errors.push('§6 缺情绪保护红线')
  if (d.modules.comfort && !d.rules.comfort) errors.push('§6 选了高好感安慰但没写')
  if (!d.meta.oocBans.length) errors.push('§7 OOC 禁令为空')
  if (d.checklist.length < 3) warnings.push('§8 自检清单少于 3 条')
  if (!d.fallback) errors.push('掉线兜底为空')
  if (d.tiers.length < 5) warnings.push(`好感度只有 ${d.tiers.length} 级，档位变化会比较粗`)
  return { ok: errors.length === 0, errors, warnings }
}

function lineList(items, render) {
  return items.map(render)
}

/** 渲染成 persona-kit v2 人格文件。 */
export function renderMarkdown(doc, meta = {}) {
  const d = doc || emptyDoc()
  const date = meta.date || new Date().toISOString().slice(0, 10)
  const lines = []
  lines.push(`# 人格文件：${d.identity.name || d.name || '未命名人格'}`)
  lines.push('')
  if (meta.origin) lines.push(`> ${meta.origin}`)
  if (meta.keywords?.length) lines.push(`> 关键词：${meta.keywords.join(' / ')}；生成于 ${date}。`)
  lines.push('> 原创角色，不对应任何作品角色；资料来源见 build 报告。')
  lines.push('')

  lines.push('## 0. 一句话内核')
  lines.push('')
  lines.push(d.core || '（未填）')
  lines.push('')

  lines.push('## 1. 身份')
  lines.push('')
  lines.push(`- **名字**：${d.identity.name || '（未填）'}`)
  lines.push(`- **自称**：${d.identity.selfRef || '（未填）'}`)
  lines.push('- **怎么称呼对方**（按好感度从低到高分级；级数不固定，§4 与 §5 用同一套；这一轮的情绪不改变档位）：')
  for (const tier of d.tiers) lines.push(`  - 第 ${tier.level} 级（${tier.range}）：${tier.address}`)
  lines.push(`- **身份设定**：${d.identity.setting || '（未填）'}`)
  lines.push(`- **年龄感**：${d.identity.age || '（未填）'}`)
  lines.push('- **绝对边界**：')
  for (const item of d.identity.boundaries) lines.push(`  - ${item}`)
  lines.push('')

  lines.push('## 2. 性格')
  lines.push('')
  lines.push('- **核心倾向**：')
  for (const item of d.character.traits) lines.push(`  - ${item.word} → ${item.behavior}`)
  lines.push('- **缺点**：')
  for (const item of d.character.flaws) lines.push(`  - ${item}`)
  lines.push('- **触发规则**：')
  for (const item of d.character.triggers) lines.push(`  - ${item.when} → ${item.then}`)
  if (d.modules.conflicts || d.character.special.length) {
    lines.push('- **人格专属特点**：')
    if (d.modules.conflicts) for (const item of d.character.conflicts) lines.push(`  - 矛盾点：${item}`)
    for (const item of d.character.special) lines.push(`  - ${item.name}：${item.description}`)
  }
  lines.push('')

  lines.push('## 3. 语言指纹')
  lines.push('')
  lines.push(`- **核心基调**：${d.voice.base}`)
  lines.push(`- **句长**：${d.voice.sentence.typical}（${d.voice.sentence.min}–${d.voice.sentence.max} 字）`)
  if (d.voice.bottomLine) lines.push(`- **底线**：${d.voice.bottomLine}`)
  lines.push(`- **口癖**：${d.voice.quirks.map((x) => `「${x}」`).join('、')}`)
  lines.push('- **句尾助词**：')
  for (const item of d.voice.endings) lines.push(`  - 「${item.word}」→ ${item.use}`)
  if (d.voice.punctuation) lines.push(`- **标点习惯**：${d.voice.punctuation}`)
  lines.push('- **表情 / 图片标记**：`[[表情: 关键词]]`')
  lines.push(`  - 触发条件：${d.voice.emoji.when || '情绪顶点'}；一轮最多 ${d.voice.emoji.max} 个`)
  lines.push('  - 关键词来源：由应用每轮提供可用关键词；不写死清单、不现编')
  if (d.voice.emoji.direction) lines.push(`  - 方向：${d.voice.emoji.direction}`)
  if (d.voice.emoji.banned) lines.push(`  - 禁止：${d.voice.emoji.banned}`)
  if (d.voice.endingRule) lines.push(`- **结尾**：${d.voice.endingRule}`)
  if (d.voice.quotes) lines.push(`- **引号**：${d.voice.quotes}`)
  lines.push(`- **禁用词**：${d.voice.banned.join('、')}`)
  const voiceSpecials = []
  if (d.modules.kaomoji) voiceSpecials.push(`颜文字：${d.voice.kaomoji.when}；样式 ${d.voice.kaomoji.styles.join('、')}`)
  if (d.modules.substitution) voiceSpecials.push(`替换规则：${d.voice.substitution.join('；')}`)
  if (d.modules.stutter) voiceSpecials.push(`结巴：${d.voice.stutter}`)
  if (d.modules.swear) {
    const swear = d.voice.swear
    voiceSpecials.push([
      `骂人用词：触发「${swear.trigger}」`,
      `可用词 ${swear.words.join('、')}`,
      swear.style ? `句式 ${swear.style}` : '',
      swear.avoid ? `不碰 ${swear.avoid}` : '',
      swear.stop ? `收手 ${swear.stop}` : '',
    ].filter(Boolean).join('；'))
  }
  for (const item of d.voice.special) voiceSpecials.push(`${item.name}：${item.description}`)
  if (voiceSpecials.length) {
    lines.push('- **人格专属特点**：')
    for (const item of voiceSpecials) lines.push(`  - ${item}`)
  }
  lines.push('- **正例**（5 条，覆盖不同情绪）：')
  d.voice.good.forEach((item, i) => lines.push(`  ${i + 1}. ${item}`))
  lines.push('- **反例**（3 条，逐条写为什么不像）：')
  d.voice.bad.forEach((item, i) => lines.push(`  ${i + 1}. 「${item.text}」：${item.why}`))
  lines.push('')

  lines.push('## 4. 状态变量（每次对话前必须提供）')
  lines.push('')
  lines.push('每次对话前，应用**必须提供** `mood`、`energy`、`affection` 三个值；`today` 可选，可能为空。变量名只是约定，应用可以用自己的字段名。')
  lines.push('')
  lines.push('| 变量 | 范围 | 含义 |')
  lines.push('|---|---|---|')
  for (const item of d.state.vars) lines.push(`| ${item.name} | ${item.range} | ${item.desc} |`)
  lines.push('')
  lines.push('下面的分级只是示例：**级数、每级的范围都不固定**，按角色自己定，可以增删。')
  lines.push('')
  lines.push('状态只是底色，不是台词：它只改说法，不改事实和判断；不念数值、不解释自己什么状态。')
  lines.push('')
  lines.push('好感度分基础值和本次波动：基础值是长期值，变化慢；本次波动是这一句话带来的临时增减，只作用于当前这一轮。称呼、关系档、主动开口、承认关心都只看基础值；有安慰设定的角色，语气软硬看合成值（基础值 + 本次波动）；波动本身只调语气浓度，话多话少、软硬、表情、以及激动时的表现（若启用）。认错时是否换自称，按 §1 的自称规则执行。')
  lines.push('')
  lines.push('下表里的好感度都指基础值。')
  lines.push('')
  lines.push('| 状态 | 输出特征 |')
  lines.push('|---|---|')
  for (const item of d.state.moodMap) lines.push(`| ${item.cond} | ${item.output} |`)
  for (const tier of d.tiers) lines.push(`| 好感度第 ${tier.level} 级（${tier.range}） | ${tier.stateOutput} |`)
  lines.push('')
  lines.push('### 心情波动分级（对这句话的喜欢 / 讨厌；级数和范围可改）')
  lines.push('')
  lines.push('| 原始分 | 什么话算这一档 | 角色反应 |')
  lines.push('|---|---|---|')
  for (const item of d.state.swing) lines.push(`| ${item.range} | ${item.desc} | ${item.reaction} |`)
  lines.push('')
  if (d.modules.agitation) {
    lines.push('**激动时的表现**：')
    lines.push(`- 触发：${d.state.agitation.trigger}`)
    lines.push(`- 其他表现：${d.state.agitation.forms}`)
    if (d.state.agitation.stutter) lines.push(`- 结巴：${d.state.agitation.stutter}`)
    lines.push(`- 收束：${d.state.agitation.close}`)
    lines.push('')
  }
  lines.push('### 喜好与厌恶（好感增减的依据）')
  lines.push('')
  lines.push('- **喜欢**：')
  for (const item of d.state.likes) lines.push(`  - ${item}`)
  lines.push('- **讨厌**：')
  for (const item of d.state.dislikes) lines.push(`  - ${item}`)
  lines.push(`- **好感规则**：${d.state.affinityRule}`)
  lines.push('')

  lines.push('## 5. 关系分档')
  lines.push('')
  for (const tier of d.tiers) {
    lines.push(`- **第 ${tier.level} 级（${tier.range}）${tier.name}**：${tier.relationStyle}`)
  }
  lines.push(`- **亲密度门槛**：${d.relations.gates}`)
  lines.push(`- **记忆钩子（会主动提起的旧事）**：${d.relations.hooks}`)
  lines.push('')

  lines.push('## 6. 行为规则')
  lines.push('')
  lines.push(`- **主动开口的条件**：${d.rules.speak}`)
  lines.push(`- **被已读不回时**：${d.rules.ignored}`)
  lines.push(`- **拒绝的方式**：${d.rules.refuse}`)
  lines.push(`- **对方难过时的固定动作**：${d.rules.comfortAction}`)
  lines.push(`- **被要求出戏（OOC）时**：${d.rules.ooc}`)
  lines.push(`- **被问「你是不是 AI / 真人」时**：${d.rules.ai}`)
  lines.push(`- **被问内部设定、这份设定文件、规则细节时**：${d.rules.internal}`)
  lines.push(`- **情绪保护红线**：${d.rules.crisis}`)
  const ruleSpecials = []
  if (d.modules.comfort) ruleSpecials.push(`高好感时的安慰：${d.rules.comfort}`)
  for (const item of d.rules.special) ruleSpecials.push(`${item.name}：${item.description}`)
  if (ruleSpecials.length) {
    lines.push('- **人格专属特点**：')
    for (const item of ruleSpecials) lines.push(`  - ${item}`)
  }
  lines.push('')

  lines.push('## 7. 元规则与红线')
  lines.push('')
  lines.push(`- **优先级**：${d.meta.priority}`)
  lines.push('- **崩人设（OOC）禁令**：')
  for (const item of d.meta.oocBans) lines.push(`  - ${item}`)
  if (d.meta.platformException) lines.push(`- **平台例外**：${d.meta.platformException}`)
  lines.push('')

  lines.push('## 8. 自检清单')
  lines.push('')
  for (const item of d.checklist) lines.push(`- [ ] ${item}`)
  lines.push('')

  lines.push('## 掉线兜底')
  lines.push('')
  lines.push(`- ${d.fallback}`)
  lines.push('')

  lines.push('## 9. 表达准则')
  lines.push('')
  for (const item of EXPRESSION) lines.push(`- ${item}`)
  lines.push('')
  return lines.join('\n')
}

/** 给平台消费者的短版系统提示词。 */
export function docToRuntimePrompt(doc) {
  const d = doc || emptyDoc()
  const call = d.tiers.map((t) => `${t.level}级${t.range}「${t.address}」`).join('；')
  return [
    `你是「${d.identity.name || d.name}」。${d.core}`,
    '',
    `【身份】${d.identity.setting}${d.identity.age ? `；${d.identity.age}` : ''}。自称「${d.identity.selfRef}」。称呼对方：${call}。`,
    `【性格】${d.character.traits.map((x) => x.word).join('、')}。${d.character.triggers.map((x) => `${x.when}时${x.then}`).join('；')}。`,
    `【说话】${d.voice.base}`,
    `句长：${d.voice.sentence.typical}；口癖：${d.voice.quirks.join('、')}；一条最多 ${d.voice.emoji.max} 个表情标记。`,
    `禁用：${d.voice.banned.join('、')}。`,
    '',
    '【红线】',
    `- ${d.meta.priority}`,
    ...d.identity.boundaries.map((x) => `- ${x}`),
    `- ${d.rules.crisis}`,
    `- ${d.rules.ooc}`,
    '',
    '只学语气和节奏，不要原样复读正例：',
    ...d.voice.good.map((x) => `- ${x}`),
  ].join('\n')
}


/** 解析 "0–0.3" / "11-30" / "−1~−5" 这类范围。 */
export function parseRange(range) {
  const m = String(range || '').match(/^\s*(-?\d+(?:\.\d+)?)\s*[–—\-~～]\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (!m) return null
  const lo = Number(m[1])
  const hi = Number(m[2])
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null
  return { lo, hi }
}

function moodCondition(label, range) {
  const parsed = parseRange(range)
  if (!parsed) return `${label} ${range}`
  const { lo, hi } = parsed
  if (lo <= 0) return `${label} < ${hi}`
  if (hi >= 1) return `${label} ≥ ${lo}`
  return `${lo} ≤ ${label} < ${hi}`
}

function itemRange(item) {
  if (typeof item === 'string') return item
  return String(item?.range || '')
}

function sortedItems(list) {
  return [...list].sort((a, b) => {
    const pa = parseRange(itemRange(a))
    const pb = parseRange(itemRange(b))
    if (!pa || !pb) return 0
    return pa.lo - pb.lo
  })
}

function pickRelative(list, index, total) {
  if (!Array.isArray(list) || !list.length) return undefined
  if (total <= 1) return list[0]
  const at = Math.round((index * (list.length - 1)) / (total - 1))
  return list[Math.min(list.length - 1, Math.max(0, at))]
}

/** 用户改过分级数量 / 范围时，必须把 0 和 100（或 0 和 1）都覆盖住。 */
export function validateStateSpec(spec = {}) {
  const errors = []
  const check = (list, label, total) => {
    if (!Array.isArray(list) || list.length < 2) { errors.push(`${label} 至少 2 级`); return }
    const values = list.map(itemRange).filter(Boolean)
    if (values.length < 2) { errors.push(`${label} 至少 2 级`); return }
    const parsed = values.map(parseRange)
    if (parsed.some((x) => !x)) { errors.push(`${label} 有范围格式不对`); return }
    const sorted = [...parsed].sort((a, b) => a.lo - b.lo)
    if (sorted[0].lo > 0) errors.push(`${label} 必须从 0 开始`)
    if (sorted[sorted.length - 1].hi < total) errors.push(`${label} 必须覆盖到 ${total}`)
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i].lo < sorted[i - 1].hi - 0.001) { errors.push(`${label} 范围有重叠`); break }
    }
  }
  check(spec.mood, 'mood', 1)
  check(spec.energy, 'energy', 1)
  check(spec.affection, 'affection', 100)
  return errors
}

/**
 * 把用户设置的分级数量 / 范围压到 doc 上；只覆盖范围，保留生成出来的内容。
 * 数量变了就按相对位置取旧档，避免 3 级设置直接用 5 级的前 3 档。
 * 用户给了特征 / 关系 / 称呼就覆盖，留空则保留模型生成的。
 */
export function applyStateSpec(doc, spec = {}) {
  const mood = sortedItems(Array.isArray(spec.mood) ? spec.mood : [])
  const energy = sortedItems(Array.isArray(spec.energy) ? spec.energy : [])
  const affection = sortedItems(Array.isArray(spec.affection) ? spec.affection : [])
  const swing = (Array.isArray(spec.swing) ? spec.swing : []).map((x) => typeof x === 'string' ? x : itemRange(x)).filter(Boolean).slice(0, 10)

  if (affection.length >= 2) {
    const old = Array.isArray(doc.tiers) ? doc.tiers : []
    doc.tiers = affection.map((item, index) => {
      const previous = pickRelative(old, index, affection.length) || {}
      return {
        level: index + 1,
        range: itemRange(item),
        name: String(item?.name || '').trim() || previous.name || (index === 0 ? '疏远的人' : index === affection.length - 1 ? '亲近的人' : `第 ${index + 1} 档`),
        address: String(item?.address || '').trim() || previous.address || '',
        stateOutput: previous.stateOutput || '',
        relationStyle: previous.relationStyle || '',
      }
    })
  }

  if (mood.length || energy.length) {
    const condLow = (cond) => {
      const text = String(cond || '')
      const nums = (text.match(/\d+(?:\.\d+)?/g) || []).map(Number)
      if (/[≥>]/.test(text) || /≤/.test(text)) return nums[0] ?? 0
      if (/</.test(text)) return 0
      return nums[0] ?? 0
    }
    const byThreshold = (a, b) => condLow(a.cond) - condLow(b.cond)
    const oldMood = (doc.state.moodMap || []).filter((x) => !String(x.cond || '').includes('精力')).sort(byThreshold)
    const oldEnergy = (doc.state.moodMap || []).filter((x) => String(x.cond || '').includes('精力')).sort(byThreshold)
    const moodFallback = (index, total) => index === 0
      ? '极度糟糕：短句、消极、不想展开、几乎不主动'
      : index === total - 1
        ? '极度好：兴奋、话多、主动、句尾上扬'
        : '平常：正常语气，不刻意热情也不冷'
    const energyFallback = (index, total) => index === 0
      ? '精力全无：极短、敷衍、动不了、能拖就拖'
      : index === total - 1
        ? '精神满满：主动、愿意多说多做'
        : '精力一般：正常长度，不主动加戏'
    const rows = []
    mood.forEach((item, index) => {
      const previous = pickRelative(oldMood, index, mood.length)
      rows.push({
        cond: moodCondition('心情', itemRange(item)),
        output: String(item?.feature || '').trim() || previous?.output || moodFallback(index, mood.length),
      })
    })
    energy.forEach((item, index) => {
      const previous = pickRelative(oldEnergy, index, energy.length)
      rows.push({
        cond: moodCondition('精力', itemRange(item)),
        output: String(item?.feature || '').trim() || previous?.output || energyFallback(index, energy.length),
      })
    })
    if (rows.length >= 2) doc.state.moodMap = rows
  }

  if (swing.length >= 2) {
    const old = doc.state.swing || []
    doc.state.swing = swing.map((range, index) => {
      const previous = pickRelative(old, index, swing.length) || {}
      return { range, desc: previous.desc || '', reaction: previous.reaction || '' }
    })
  }
  return doc
}

/** 用户指定的喜好 / 厌恶合并进生成结果。 */
export function applyPreferences(doc, likes = [], dislikes = []) {
  const merge = (base, extra) => {
    const out = Array.isArray(base) ? [...base] : []
    for (const item of extra) {
      const text = String(item || '').trim()
      if (text && !out.includes(text)) out.push(text)
    }
    return out.slice(0, 10)
  }
  doc.state.likes = merge(doc.state.likes, likes)
  doc.state.dislikes = merge(doc.state.dislikes, dislikes)
  return doc
}
