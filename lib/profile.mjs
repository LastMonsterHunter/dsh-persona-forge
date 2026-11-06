/**
 * dsh-persona-forge — 语料画像（确定性统计层）。
 *
 * 目的：人格规则不能再靠模型自由发挥，要有可回查的数字。
 * 这一层不碰网络、不碰 LLM、不写文件，只吃 corpus 吐统计。
 *
 * 两类池子：
 *   op     —— UP 主 / 楼主自己的话（字幕、简介、正文）。价值观、立场只能来自这里。
 *   reply  —— 观众 / 楼层反应（评论、楼中楼）。语感、接话节奏主要来自这里。
 */

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B50}\u{2B55}]/gu
const BRACKET_ACTION = /[（(][^（）()\n]{1,15}[）)]/g
const TILDE = /[~～]/g
const ELLIPSIS = /…{1,2}|\.{3,}/g
const QUESTION_END = /[?？]\s*$/
const QUESTION_WORD = /[吗呢吧啊]\s*$/
const EXCLAIM = /[!！]/

/** 鱼八股 / AI 腔指纹：命中即扣分，不进人格。 */
export const FISH_BAGU = [
  { key: '记账腔', re: /我记(着|下了|得|在心里)/ },
  { key: '认领腔', re: /这条我认|我认了|认了$/ },
  { key: '说到根上', re: /说到根上|这本身|本质上是/ },
  { key: 'AI 自称', re: /作为一个\s*(AI|ai|人工智能|语言模型)/ },
  { key: '客服腔', re: /希望对你有帮助|有什么可以帮|很高兴为你/ },
  { key: '通稿腔', re: /值得一看|干货满满|节奏紧凑|不容错过/ },
  { key: '清单腔', re: /首先[，,]?其次|第一[，,].*第二[，,]/ },
  { key: '转折模板', re: /不是[^，。！？\n]{1,10}[，,]?\s*而是/ },
  { key: '元规则', re: /不写破折号|不要用句号|记住这条规则/ },
]

const PARTICLE_TAIL = /[呀哦嘛啦吧呢啊哈喔捏诶咯嘞呗噢]/
const ENDING_STOP = new Set([
  '的', '了', '是', '在', '我', '你', '他', '她', '它', '们', '这', '那', '就', '都', '也', '还', '和', '与', '有', '没',
  '不', '很', '太', '吧', '啊', '呀', '呢', '哦', '嘛', '啦', '吗', '么', '着', '过', '个', '上', '下', '里', '来', '去',
  '说', '做', '看', '好', '对', '要', '会', '能', '得', '把', '被', '给', '让', '从', '到', '为', '以', '而', '但', '却',
])

function pct(list, p) {
  if (!list.length) return 0
  const sorted = [...list].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))
  return sorted[index]
}

function round(value, digits = 0) {
  const unit = 10 ** digits
  return Math.round(value * unit) / unit
}

/** 把一条长文本切成短句，用于长度与句尾统计。 */
export function splitClauses(text) {
  return String(text || '')
    .split(/[\n\r。！？!?…~～]+/)
    .map((x) => x.trim())
    .filter(Boolean)
}

/** 单条消息的统计单位：评论按整条，字幕按整段。 */
function analyzeList(texts) {
  const messages = texts.map((x) => String(x.text || '').trim()).filter((x) => x.length >= 2)
  const chars = messages.map((x) => Array.from(x).length)
  const clauses = messages.flatMap((x) => splitClauses(x))
  const join = messages.join('\n')
  const totalChars = chars.reduce((a, b) => a + b, 0) || 1

  // 句尾分两类：语气助词（呀哦嘛啦…）和普通收尾（的事／没错…）。
  const particles = new Map()
  const endings = new Map()
  for (const clause of clauses) {
    const chars = Array.from(clause)
    if (!chars.length) continue
    const last = chars[chars.length - 1]
    if (PARTICLE_TAIL.test(last)) {
      particles.set(last, (particles.get(last) || 0) + 1)
      continue
    }
    if (ENDING_STOP.has(last)) continue
    const key = chars.slice(-2).join('')
    if (key.length > 1) endings.set(key, (endings.get(key) || 0) + 1)
  }
  const minEnding = Math.max(2, Math.min(20, Math.round(clauses.length * 0.002)))
  const topEndings = [
    ...[...particles.entries()].map(([word, count]) => ({ word, count, kind: 'particle' })),
    ...[...endings.entries()].map(([word, count]) => ({ word, count, kind: 'tail' })),
  ]
    .filter((x) => x.count >= (x.kind === 'particle' ? Math.max(2, Math.floor(minEnding / 2)) : minEnding))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const questions = messages.filter((x) => QUESTION_END.test(x) || QUESTION_WORD.test(x)).length
  const emojiHits = (join.match(EMOJI) || []).length
  const bracketHits = (join.match(BRACKET_ACTION) || []).length
  const tildeHits = (join.match(TILDE) || []).length
  const ellipsisHits = (join.match(ELLIPSIS) || []).length
  const exclaimMessages = messages.filter((x) => EXCLAIM.test(x)).length
  const selfRef = (join.match(/(本[鱼鲸喵狐猫妹小姐少爷喵])|(人家)|(老子)|(俺)/g) || []).length
  const address = (join.match(/(主人|你们|大伙|各位|兄弟们|姐妹)/g) || []).length

  return {
    count: messages.length,
    chars: {
      p10: pct(chars, 0.1),
      p25: pct(chars, 0.25),
      median: pct(chars, 0.5),
      p75: pct(chars, 0.75),
      p90: pct(chars, 0.9),
      mean: round(totalChars / messages.length, 1),
      max: chars.length ? Math.max(...chars) : 0,
    },
    per1000: {
      emoji: round((emojiHits / totalChars) * 1000, 1),
      bracket: round((bracketHits / totalChars) * 1000, 1),
      tilde: round((tildeHits / totalChars) * 1000, 1),
      ellipsis: round((ellipsisHits / totalChars) * 1000, 1),
      selfRef: round((selfRef / totalChars) * 1000, 1),
      address: round((address / totalChars) * 1000, 1),
    },
    // 每千字折算不够直观，补一份“每条消息”口径，规则里直接写数字。
    perMessage: {
      emoji: round(emojiHits / Math.max(1, messages.length), 2),
      bracket: round(bracketHits / Math.max(1, messages.length), 2),
      tilde: round(tildeHits / Math.max(1, messages.length), 2),
      ellipsis: round(ellipsisHits / Math.max(1, messages.length), 2),
      question: round(questions / Math.max(1, messages.length) * 100, 1),
      exclaim: round(exclaimMessages / Math.max(1, messages.length) * 100, 1),
      long: round(messages.filter((x) => Array.from(x).length > 60).length / Math.max(1, messages.length) * 100, 1),
    },
    clauseChars: { median: pct(clauses.map((x) => Array.from(x).length), 0.5) },
    topEndings,
  }
}

/** 从语料里抽两类文本池。 */
export function collectPools(corpus = [], source = 'bilibili') {
  const op = []
  const reply = []
  for (const item of corpus) {
    if (source === 'tieba') {
      if (item.desc) op.push({ text: item.desc, where: '楼主正文', bvid: item.bvid })
      for (const comment of item.comments || []) {
        const kind = comment.kind === 'R' ? '楼中楼' : '楼层'
        if (comment.text) reply.push({ text: comment.text, where: kind, bvid: item.bvid })
        for (const sub of comment.replies || []) {
          if (sub.text) reply.push({ text: sub.text, where: '楼中楼', bvid: item.bvid })
        }
      }
      continue
    }
    if (item.subtitle) op.push({ text: item.subtitle, where: '字幕', bvid: item.bvid, at: 0 })
    else if (Array.isArray(item.subtitleSegments)) {
      for (const seg of item.subtitleSegments) op.push({ text: seg.text, where: '字幕', bvid: item.bvid, at: seg.start })
    }
    if (item.desc) op.push({ text: item.desc, where: '简介', bvid: item.bvid })
    for (const comment of item.comments || []) {
      const kind = comment.kind === 'R' ? '回复' : '评论'
      if (comment.text) reply.push({ text: comment.text, where: kind, bvid: item.bvid })
      for (const sub of comment.replies || []) {
        if (sub.text) reply.push({ text: sub.text, where: '回复', bvid: item.bvid })
      }
    }
  }
  return { op, reply }
}

/** 鱼八股命中统计。 */
export function scanBagu(texts = []) {
  const hits = new Map()
  const samples = new Map()
  for (const item of texts) {
    const text = String(item.text || '')
    for (const rule of FISH_BAGU) {
      if (rule.re.test(text)) {
        hits.set(rule.key, (hits.get(rule.key) || 0) + 1)
        if (!samples.has(rule.key)) samples.set(rule.key, text.slice(0, 60))
      }
    }
  }
  return [...hits.entries()].map(([key, count]) => ({ key, count, sample: samples.get(key) || '' }))
}

/**
 * 语料画像。返回的数字都可直接写进人格规则里做依据。
 *
 * @param {Array} corpus  采集层产出的记录（bilibili 视频 / tieba 帖子）
 * @param {{source?: string}} options
 */
export function buildProfile(corpus = [], { source = 'bilibili' } = {}) {
  const pools = collectPools(corpus, source)
  const op = analyzeList(pools.op)
  const reply = analyzeList(pools.reply)
  const allTexts = [...pools.op, ...pools.reply]
  const bagu = scanBagu(allTexts)
  const baguRate = round(
    (bagu.reduce((n, x) => n + x.count, 0) / Math.max(1, allTexts.length)) * 100,
    2,
  )
  // 语感以 reply 为主；reply 太薄时退回 op。
  const voice = reply.count >= 50 ? reply : (reply.count >= 10 ? reply : op)
  const notes = []
  if (reply.count < 50) notes.push(`反应池只有 ${reply.count} 条，语感统计以 ${reply.count >= 10 ? '反应池' : '原话池'} 为准`)
  if (op.count < 20) notes.push(`原话池只有 ${op.count} 条，价值观证据偏少`)
  if (bagu.length) notes.push(`语料里有 ${bagu.reduce((n, x) => n + x.count, 0)} 条鱼八股/AI 腔，不该学`)

  return {
    source,
    generatedAt: new Date().toISOString(),
    corpus: { videos: corpus.length, texts: allTexts.length },
    op,
    reply,
    voice,
    bagu,
    baguRate,
    notes,
  }
}

/** 把画像写成给模型看的几行，数字必须出现。 */
export function profileLines(profile) {
  if (!profile) return []
  const fmt = (label, pool) => {
    if (!pool || !pool.count) return `${label}：没有可用文本`
    return [
      `${label}：${pool.count} 条，字数中位 ${pool.chars.median}（25% ${pool.chars.p25} / 75% ${pool.chars.p75}，最长 ${pool.chars.max}）`,
      `${label} 每条：emoji ${pool.perMessage.emoji}、括号动作 ${pool.perMessage.bracket}、波浪号 ${pool.perMessage.tilde}、省略号 ${pool.perMessage.ellipsis}、问句 ${pool.perMessage.question}%、感叹 ${pool.perMessage.exclaim}%、超 60 字 ${pool.perMessage.long}%`,
      `${label} 句尾高频：${pool.topEndings.length ? pool.topEndings.map((x) => `${x.word}(${x.count})`).join('、') : '无稳定句尾'}`,
    ].join('\n')
  }
  const lines = [
    '=== 语料画像（确定性统计，规则必须引用这里的数字）===',
    fmt('UP/楼主 原话池', profile.op),
    fmt('观众/楼层 反应池', profile.reply),
    `语感以「${profile.voice === profile.reply ? '反应池' : '原话池'}」为准：字数中位 ${profile.voice?.chars?.median ?? 0}，问句率 ${profile.voice?.perMessage?.question ?? 0}%`,
    `鱼八股/AI 腔命中：${profile.bagu.length ? profile.bagu.map((x) => `${x.key} ${x.count} 次（「${x.sample}」）`).join('；') : '0 条'}；命中率 ${profile.baguRate}%`,
    profile.notes.length ? `注意：${profile.notes.join('；')}` : '',
  ]
  return lines.filter(Boolean)
}

/** 自检用的阈值：从画像里推出来的可判定目标。 */
export function profileTargets(profile) {
  const voice = profile?.voice || {}
  const median = Number(voice.chars?.median) || 20
  return {
    length: { min: Math.max(3, Math.round(median * 0.4)), max: Math.max(12, Math.round(median * 2.2)) },
    emojiPerMessage: Number(voice.perMessage?.emoji) || 0,
    bracketPerMessage: Number(voice.perMessage?.bracket) || 0,
    tildePerMessage: Number(voice.perMessage?.tilde) || 0,
    questionRate: Number(voice.perMessage?.question) || 0,
    baguMax: 0,
  }
}
