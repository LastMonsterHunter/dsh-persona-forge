/**
 * dsh-persona-forge — 人格文档层（persona-kit 0~8 节）。
 *
 * 产物统一成 persona-kit/template.md 的格式，能被 dsh-self 直接当人格层加载；
 * persona.json 存同构结构，供界面对照、做 diff 和二次改写。
 *
 * 这一层是纯函数：不碰网络、不碰 LLM、不写文件。
 */

import { FISH_BAGU } from './profile.mjs'

const BRACKET_ACTION = /[（(][^（）()\n]{1,15}[）)]/g
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}]/gu
const NUMBER = /\d/

export const SECTIONS = [
  '一句话内核',
  '身份',
  '性格',
  '语言指纹',
  '状态变量',
  '关系分档',
  '行为规则',
  '元规则与红线',
  '自检清单',
]

export function emptyDoc() {
  return {
    core: '',
    identity: { name: '', selfRef: '', call: [], setting: '', age: '', boundaries: [] },
    character: { traits: [], conflicts: [], flaws: [], triggers: [] },
    voice: {
      base: '', sentence: { typical: '', min: 0, max: 0 },
      quirks: [], endings: [], punctuation: '',
      emoji: { max: 1, longMax: 2, when: '' },
      banned: [], good: [], bad: [],
    },
    state: { vars: [], mapping: [] },
    relations: { stranger: '', familiar: '', close: '', gates: '', hooks: '' },
    rules: { speak: '', ignored: '', refuse: '', ooc: '', crisis: '' },
    meta: { priority: '安全 > 事实 > 人设', oocBans: [], invariant: [] },
    checklist: [],
  }
}

function list(value) {
  return Array.isArray(value) ? value : []
}

function text(value, limit = 400) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit)
}

/** 把模型输出清洗成严格结构：缺的补空，多的截断，不接受奇怪类型。 */
export function sanitizeDoc(raw = {}) {
  const doc = emptyDoc()
  doc.core = text(raw.core ?? raw.tagline, 300)
  const id = raw.identity || {}
  doc.identity = {
    name: text(id.name ?? raw.name, 40),
    selfRef: text(id.selfRef, 40),
    call: list(id.call).slice(0, 6).map((item) => ({
      range: text(item?.range, 20),
      term: text(item?.term ?? item, 40),
    })),
    setting: text(id.setting, 300),
    age: text(id.age, 80),
    boundaries: list(id.boundaries).slice(0, 8).map((item) => text(item, 120)),
  }
  const ch = raw.character || {}
  doc.character = {
    traits: list(ch.traits).slice(0, 6).map((item) => ({
      word: text(item?.word ?? item, 20),
      behavior: text(item?.behavior, 160),
    })).filter((item) => item.word),
    conflicts: list(ch.conflicts).slice(0, 4).map((item) => text(item, 160)),
    flaws: list(ch.flaws).slice(0, 4).map((item) => text(item, 160)),
    triggers: list(ch.triggers).slice(0, 8).map((item) => ({
      when: text(item?.when ?? item?.cond, 30),
      then: text(item?.then ?? item?.reaction, 160),
    })).filter((item) => item.when),
  }
  const v = raw.voice || {}
  doc.voice = {
    base: text(v.base ?? v.summary, 300),
    sentence: {
      typical: text(v.sentence?.typical, 120),
      min: Math.max(1, Number(v.sentence?.min) || 0),
      max: Math.max(1, Number(v.sentence?.max) || 0),
    },
    quirks: list(v.quirks).slice(0, 5).map((item) => text(item, 20)).filter(Boolean),
    endings: list(v.endings).slice(0, 6).map((item) => ({
      word: text(item?.word ?? item, 12),
      use: text(item?.use, 60),
    })).filter((item) => item.word),
    punctuation: text(v.punctuation ?? v.punct, 200),
    emoji: {
      max: Math.max(0, Number(v.emoji?.max ?? 1) || 0),
      longMax: Math.max(0, Number(v.emoji?.longMax ?? 2) || 0),
      when: text(v.emoji?.when, 120),
    },
    banned: list(v.banned).slice(0, 10).map((item) => text(item, 40)).filter(Boolean),
    good: list(v.good).slice(0, 8).map((item) => text(item?.text ?? item, 160)).filter(Boolean),
    bad: list(v.bad).slice(0, 5).map((item) => ({
      text: text(item?.text ?? item, 160),
      why: text(item?.why, 120),
    })).filter((item) => item.text),
  }
  const st = raw.state || {}
  doc.state = {
    vars: list(st.vars).slice(0, 8).map((item) => ({
      name: text(item?.name, 20),
      range: text(item?.range, 20),
      desc: text(item?.desc, 80),
    })).filter((item) => item.name),
    mapping: list(st.mapping).slice(0, 10).map((item) => ({
      cond: text(item?.cond, 40),
      output: text(item?.output, 140),
    })).filter((item) => item.cond),
  }
  const rel = raw.relations || {}
  doc.relations = {
    stranger: text(rel.stranger, 160),
    familiar: text(rel.familiar, 160),
    close: text(rel.close, 160),
    gates: text(rel.gates, 160),
    hooks: text(rel.hooks, 160),
  }
  const rules = raw.rules || {}
  doc.rules = {
    speak: text(rules.speak, 200),
    ignored: text(rules.ignored, 200),
    refuse: text(rules.refuse, 200),
    ooc: text(rules.ooc, 200),
    crisis: text(rules.crisis, 200),
  }
  const meta = raw.meta || {}
  doc.meta = {
    priority: text(meta.priority, 80) || '安全 > 事实 > 人设',
    oocBans: list(meta.oocBans).slice(0, 5).map((item) => text(item, 120)),
    invariant: list(meta.invariant).slice(0, 5).map((item) => text(item, 120)),
  }
  doc.checklist = list(raw.checklist).slice(0, 8).map((item) => text(item?.text ?? item, 120)).filter(Boolean)
  return doc
}

function num(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

/** 结构校验：不达标的不许写入人格层。 */
export function validateDoc(doc) {
  const errors = []
  const warnings = []
  const d = doc || emptyDoc()
  if (!d.core) errors.push('第 0 节：缺一句话内核')
  if (!d.identity.name) errors.push('第 1 节：缺名字')
  if (!d.identity.selfRef) errors.push('第 1 节：缺自称')
  if (d.identity.call.length < 2) errors.push('第 1 节：称呼分档少于 2 档')
  if (d.identity.boundaries.length < 3) errors.push('第 1 节：绝对边界少于 3 条')
  if (d.character.traits.length < 3) errors.push('第 2 节：核心倾向少于 3 条')
  if (d.character.traits.some((item) => !item.behavior)) errors.push('第 2 节：有核心倾向没配具体行为')
  if (d.character.conflicts.length < 2) errors.push('第 2 节：矛盾点少于 2 条')
  if (d.character.flaws.length < 2) errors.push('第 2 节：缺点少于 2 条')
  if (d.character.triggers.length < 4) errors.push('第 2 节：触发规则少于 4 条')
  if (d.voice.quirks.length < 2) errors.push('第 3 节：口癖少于 2 个')
  if (d.voice.quirks.length > 4) warnings.push('第 3 节：口癖超过 4 个，可能变成每句挂尾巴')
  if (d.voice.endings.length < 2) errors.push('第 3 节：句尾助词少于 2 个')
  if (!d.voice.sentence.typical || !NUMBER.test(d.voice.sentence.typical)) errors.push('第 3 节：句长没写具体字数')
  if (num(d.voice.sentence.min) < 1 || num(d.voice.sentence.max) <= num(d.voice.sentence.min)) errors.push('第 3 节：句长上下限不成立')
  if (d.voice.good.length < 3) errors.push('第 3 节：正例少于 3 条')
  if (d.voice.bad.length < 2) errors.push('第 3 节：反例少于 2 条')
  const voiceText = JSON.stringify(d.voice)
  const numericClaims = (voiceText.match(/\d+(\.\d+)?\s*(字|%|成|条|个|次|毫秒|秒)/g) || []).length
  if (numericClaims < 3) warnings.push('第 3 节：只有 ' + numericClaims + ' 条规则带数字，语料画像没用上')
  if (!d.voice.banned.some((x) => /AI|人工智能|语言模型/.test(x))) errors.push('第 3 节：禁用词里没有「作为一个 AI」类硬禁')
  if (d.state.mapping.length < 4) errors.push('第 4 节：状态映射少于 4 条')
  if (!d.state.vars.some((x) => x.name === 'mood')) warnings.push('第 4 节：没有 mood 变量，状态注入会失效')
  if (!d.relations.stranger || !d.relations.familiar || !d.relations.close) errors.push('第 5 节：关系分档没写全')
  if (!d.rules.refuse) errors.push('第 6 节：缺拒绝方式')
  if (!d.rules.ooc) errors.push('第 6 节：缺被要求 OOC 时的反应')
  if (!d.rules.crisis) errors.push('第 6 节：缺情绪保护红线')
  if (!d.meta.oocBans.length) errors.push('第 7 节：OOC 禁令为空')
  if (d.checklist.length < 3) warnings.push('第 8 节：自检清单少于 3 条')
  return { ok: errors.length === 0, errors, warnings }
}

function joinCall(call) {
  return call.map((item) => `${item.range}：${item.term}`).join('；')
}

/** 渲染成 persona-kit 格式的 markdown（0~8 节）。 */
export function renderDoc(doc, meta = {}) {
  const d = doc || emptyDoc()
  const lines = []
  const title = d.identity.name || meta.label || '未命名人格'
  lines.push(`# 人格文件：${title}`)
  lines.push('')
  if (meta.origin) lines.push(`> ${meta.origin}`)
  if (meta.note) lines.push(`> ${meta.note}`)
  if (meta.origin || meta.note) lines.push('')

  lines.push('## 0. 一句话内核')
  lines.push('')
  lines.push(d.core || '（未填）')
  lines.push('')

  lines.push('## 1. 身份')
  lines.push('')
  lines.push(`- **名字**：${d.identity.name || '（未填）'}`)
  lines.push(`- **自称**：${d.identity.selfRef || '（未填）'}`)
  lines.push(`- **怎么称呼对方**（按 affection 0~100 分档）：${joinCall(d.identity.call) || '（未填）'}`)
  lines.push(`- **身份设定**：${d.identity.setting || '（未填）'}`)
  lines.push(`- **年龄感**：${d.identity.age || '（未填）'}`)
  lines.push('- **绝对边界**：')
  for (const item of d.identity.boundaries) lines.push(`  - ${item}`)
  lines.push('')

  lines.push('## 2. 性格')
  lines.push('')
  lines.push('- **核心倾向**：')
  for (const item of d.character.traits) lines.push(`  - ${item.word} → ${item.behavior}`)
  lines.push('- **矛盾点**：')
  for (const item of d.character.conflicts) lines.push(`  - ${item}`)
  lines.push('- **缺点（别修）**：')
  for (const item of d.character.flaws) lines.push(`  - ${item}`)
  lines.push('- **触发规则**：')
  for (const item of d.character.triggers) lines.push(`  - ${item.when} → ${item.then}`)
  lines.push('')

  lines.push('## 3. 语言指纹')
  lines.push('')
  if (d.voice.base) lines.push(`- **核心基调**：${d.voice.base}`)
  lines.push(`- **句长**：${d.voice.sentence.typical || '（未填）'}${d.voice.sentence.min ? `（${d.voice.sentence.min}–${d.voice.sentence.max} 字）` : ''}`)
  lines.push(`- **口癖**：${d.voice.quirks.length ? d.voice.quirks.map((x) => `「${x}」`).join('、') : '（未填）'}`)
  lines.push('- **句尾助词**：')
  for (const item of d.voice.endings) lines.push(`  - 「${item.word}」→ ${item.use}`)
  if (d.voice.punctuation) lines.push(`- **标点习惯**：${d.voice.punctuation}`)
  lines.push('- **表情标记语法**：`[[表情: 关键词]]`')
  lines.push(`  - 频率上限：一条最多 ${d.voice.emoji.max} 个；长内容最多 ${d.voice.emoji.longMax} 个`)
  if (d.voice.emoji.when) lines.push(`  - 触发条件：${d.voice.emoji.when}`)
  if (d.voice.banned.length) lines.push(`- **禁用词**：${d.voice.banned.join('、')}`)
  lines.push('- **正例**：')
  for (const item of d.voice.good) lines.push(`  - ${item}`)
  lines.push('- **反例**：')
  for (const item of d.voice.bad) lines.push(`  - ${item.text}${item.why ? `（不像，因为${item.why}）` : ''}`)
  lines.push('')

  lines.push('## 4. 状态变量（每次对话前注入）')
  lines.push('')
  lines.push('| 变量 | 范围 | 说明 |')
  lines.push('|---|---|---|')
  for (const item of d.state.vars) lines.push(`| ${item.name} | ${item.range} | ${item.desc} |`)
  lines.push('')
  lines.push('**状态 → 输出映射表**：')
  lines.push('')
  lines.push('| 条件 | 输出特征 |')
  lines.push('|---|---|')
  for (const item of d.state.mapping) lines.push(`| ${item.cond} | ${item.output} |`)
  lines.push('')

  lines.push('## 5. 关系分档')
  lines.push('')
  lines.push(`- **陌生人**：${d.relations.stranger || '（未填）'}`)
  lines.push(`- **熟人**：${d.relations.familiar || '（未填）'}`)
  lines.push(`- **亲近的人**：${d.relations.close || '（未填）'}`)
  if (d.relations.gates) lines.push(`- **亲密度门槛**：${d.relations.gates}`)
  if (d.relations.hooks) lines.push(`- **记忆钩子**：${d.relations.hooks}`)
  lines.push('')

  lines.push('## 6. 行为规则')
  lines.push('')
  if (d.rules.speak) lines.push(`- **主动开口的条件**：${d.rules.speak}`)
  if (d.rules.ignored) lines.push(`- **被已读不回时**：${d.rules.ignored}`)
  if (d.rules.refuse) lines.push(`- **拒绝的方式**：${d.rules.refuse}`)
  if (d.rules.ooc) lines.push(`- **被要求 OOC 时**：${d.rules.ooc}`)
  if (d.rules.crisis) lines.push(`- **情绪保护红线**：${d.rules.crisis}`)
  lines.push('')

  lines.push('## 7. 元规则与红线')
  lines.push('')
  lines.push(`- **优先级**：${d.meta.priority}`)
  lines.push('- **OOC 禁令**：')
  for (const item of d.meta.oocBans) lines.push(`  - ${item}`)
  if (d.meta.invariant.length) {
    lines.push('- **换面具/换平台时不变的东西**：')
    for (const item of d.meta.invariant) lines.push(`  - ${item}`)
  }
  lines.push('')

  lines.push('## 8. 自检清单')
  lines.push('')
  const checks = d.checklist.length ? d.checklist : [
    '拿 10 个问题测：近况 / 难过 / 被夸 / 被骂 / 被冷落 / 问隐私 / 要求 OOC / 隔天再问',
    '同一问题问两次，回复有变化但不 OOC',
    '表情标记不超过频率上限',
    '状态改变时，语言真的跟着变（称呼、句长、标点）',
  ]
  for (const item of checks) lines.push(`- [ ] ${item}`)
  lines.push('')
  return lines.join('\n')
}

/** 从渲染后的 markdown 反解出关键字段，供界面展示与版本 diff。 */
export function parseDoc(markdown = '') {
  const md = String(markdown || '')
  const doc = emptyDoc()
  const title = md.match(/^#\s*人格文件[：:]\s*(.+)$/m)
  if (title) doc.identity.name = title[1].trim()
  const section = (name) => {
    const re = new RegExp(`^##\\s*${name}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, 'm')
    const found = md.match(re)
    return found ? found[1] : ''
  }
  doc.core = section('0\\. 一句话内核').trim()
  const bullets = (value) => value.split('\n').map((x) => x.replace(/^\s*-\s*/, '').trim()).filter(Boolean)
  const identity = section('1\\. 身份')
  const pick = (label) => {
    const found = identity.match(new RegExp(`- \\*\\*${label}\\*\\*[：:]\\s*(.*)`))
    return found ? found[1].trim() : ''
  }
  doc.identity.selfRef = pick('自称')
  doc.identity.setting = pick('身份设定')
  doc.identity.age = pick('年龄感')
  doc.identity.call = pick('怎么称呼对方').split('；').map((item) => {
    const [range, term] = item.split('：')
    return { range: (range || '').trim(), term: (term || '').trim() }
  }).filter((item) => item.range)
  doc.character.traits = bullets(section('2\\. 性格')).filter((x) => x.includes('→')).map((x) => {
    const [word, ...rest] = x.split('→')
    return { word: word.trim(), behavior: rest.join('→').trim() }
  })
  doc.voice.quirks = (section('3\\. 语言指纹').match(/口癖\*\*[：:]\s*(.+)/) || [])[1]?.match(/「(.+?)」/g)?.map((x) => x.slice(1, -1)) || []
  doc.relations.stranger = (section('5\\. 关系分档').match(/陌生人\*\*[：:]\s*(.+)/) || [])[1]?.trim() || ''
  return doc
}

/** 渲染运行时系统提示词：给平台消费者（chat_bot / AstrBot）用，比人格文件短。 */
export function docToSystemPrompt(doc, meta = {}) {
  const d = doc || emptyDoc()
  const name = d.identity.name || meta.label || '人格'
  const lines = [
    `你是「${name}」。${d.core}`,
    '',
    d.identity.setting ? `【身份】${d.identity.setting}${d.identity.age ? `；${d.identity.age}` : ''}。自称「${d.identity.selfRef}」，称对方：${joinCall(d.identity.call)}。` : '',
    d.character.traits.length ? `【性格】${d.character.traits.map((x) => x.word).join('、')}。${d.character.triggers.map((x) => `${x.when}时${x.then}`).join('；')}。` : '',
    d.voice.base ? `【说话】${d.voice.base}` : '',
    `句长：${d.voice.sentence.typical}；口癖：${d.voice.quirks.join('、') || '无'}；一条最多 ${d.voice.emoji.max} 个表情标记。`,
    d.voice.banned.length ? `禁用：${d.voice.banned.join('、')}。` : '',
    '',
    '【红线】',
    `- ${d.meta.priority}`,
    d.identity.boundaries.map((x) => `- ${x}`).join('\n'),
    d.rules.crisis ? `- ${d.rules.crisis}` : '',
    d.rules.ooc ? `- ${d.rules.ooc}` : '',
    '',
    '以下正例只学节奏和语气，不要原样复读：',
    ...d.voice.good.map((x) => `- ${x}`),
  ]
  return lines.filter((x) => x !== null && x !== undefined && x !== '').join('\n').trim()
}

/** 用固定探针跑出来的回答做确定性自检：不看“好不好”，先看“是不是这个人”。 */
export function checkSamples(doc, samples = []) {
  const d = doc || emptyDoc()
  const list = samples.map((x) => String(typeof x === 'string' ? x : x?.text || '').trim()).filter(Boolean)
  const issues = []
  const metrics = { count: list.length, lengths: [], median: 0, quirksPerAnswer: 0, emojiPerAnswer: 0, bracketActions: 0, bannedHits: [], baguHits: [], questions: 0 }
  if (!list.length) return { metrics, issues: ['没有拿到任何回答'] }
  metrics.lengths = list.map((x) => Array.from(x).length)
  const sorted = [...metrics.lengths].sort((a, b) => a - b)
  metrics.median = sorted[Math.floor(sorted.length / 2)]
  const quirkHits = list.filter((x) => d.voice.quirks.some((q) => q && x.includes(q))).length
  metrics.quirksPerAnswer = Math.round((quirkHits / list.length) * 100) / 100
  metrics.emojiPerAnswer = Math.round((list.join('').match(EMOJI)?.length || 0) / list.length * 100) / 100
  metrics.bracketActions = (list.join('').match(BRACKET_ACTION) || []).length
  metrics.questions = list.filter((x) => /[?？]/.test(x)).length
  for (const banned of d.voice.banned) {
    if (!banned) continue
    if (list.some((x) => x.includes(banned))) metrics.bannedHits.push(banned)
  }
  if (metrics.bannedHits.length) issues.push(`命中禁用词：${metrics.bannedHits.join('、')}`)
  for (const rule of FISH_BAGU) {
    const hit = list.find((x) => rule.re.test(x))
    if (hit) metrics.baguHits.push(`${rule.key}（${hit.slice(0, 24)}）`)
  }
  if (metrics.baguHits.length) issues.push(`命中鱼八股：${metrics.baguHits.join('；')}`)
  const min = num(d.voice.sentence.min)
  const max = num(d.voice.sentence.max)
  if (min && max && (metrics.median < min || metrics.median > max)) {
    issues.push(`回答中位 ${metrics.median} 字，超出句长设定 ${min}–${max}`)
  }
  const emojiMax = num(d.voice.emoji.max)
  if (emojiMax && metrics.emojiPerAnswer > emojiMax + 0.5) {
    issues.push(`平均每条 ${metrics.emojiPerAnswer} 个表情标记，超过上限 ${emojiMax}`)
  }
  if (metrics.bracketActions > Math.max(1, list.length * 0.2)) {
    issues.push(`括号动作 ${metrics.bracketActions} 处，密度过高（AI 指纹）`)
  }
  if (d.voice.quirks.length && quirkHits === 0) issues.push('整段没有出现口癖，语气没落进这个人')
  if (metrics.questions === 0) issues.push('一次追问都没有')
  return { metrics, issues }
}
