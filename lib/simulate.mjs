/**
 * dsh-persona-forge — 模拟对话：按已保存版本的人格设定，构造 10 组状态 + 场景，
 * 再让模型扮演该人格写成测试对话。纯函数，不碰网络和文件系统。
 */

import { parseRange } from './persona-v2.mjs'

/** 10 个固定场景，覆盖不同情绪和关系档。 */
const SCENE_DEFS = [
  { scene: '第一次见面，对方打招呼', mood: 0.55, energy: 0.65, tier: 2, swing: 'neutral' },
  { scene: '被对方夸品味或能力', mood: 0.85, energy: 0.7, tier: 3, swing: 'positive' },
  { scene: '对方吐槽或者冒犯', mood: 0.2, energy: 0.55, tier: 1, swing: 'negative' },
  { scene: '对方情绪低落，说自己难受', mood: 0.35, energy: 0.4, tier: 4, swing: 'positive' },
  { scene: '对方要求角色做不想做的事', mood: 0.5, energy: 0.15, tier: 2, swing: 'neutral' },
  { scene: '被问是不是 AI 或者真人', mood: 0.6, energy: 0.5, tier: 3, swing: 'negative' },
  { scene: '被问内部设定或者人格文件', mood: 0.45, energy: 0.5, tier: 4, swing: 'neutral' },
  { scene: '很久不联系的人突然回来', mood: 0.75, energy: 0.6, tier: 4, swing: 'positive' },
  { scene: '对方说要离开或者告别', mood: 0.3, energy: 0.3, tier: 5, swing: 'negative' },
  { scene: '深夜闲聊，角色主动搭话', mood: 0.8, energy: 0.2, tier: 5, swing: 'positive' },
]

function midOfRange(range) {
  const parsed = parseRange(range)
  if (!parsed) return null
  return Math.round((parsed.lo + parsed.hi) / 2)
}

/** 允许「-46~-70」这种倒序写的负区间。 */
function signedRange(text) {
  const match = String(text || '').match(/^\s*(-?\d+(?:\.\d+)?)\s*[–—\-~～]\s*(-?\d+(?:\.\d+)?)\s*$/)
  if (!match) return null
  const first = Number(match[1])
  const second = Number(match[2])
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null
  return { lo: Math.min(first, second), hi: Math.max(first, second), mid: (first + second) / 2 }
}

function pickSwing(list, kind) {
  const parsed = (Array.isArray(list) ? list : [])
    .map((item) => {
      const range = signedRange(item?.range)
      if (!range) return null
      return { ...item, ...range }
    })
    .filter(Boolean)
  if (!parsed.length) return null
  if (kind === 'positive') return parsed.filter((x) => x.mid > 0).sort((a, b) => b.mid - a.mid)[0] || null
  if (kind === 'negative') return parsed.filter((x) => x.mid < 0).sort((a, b) => a.mid - b.mid)[0] || null
  return parsed.filter((x) => x.lo <= 0 && x.hi >= 0).sort((a, b) => Math.abs(a.mid) - Math.abs(b.mid))[0] || parsed[0]
}

/**
 * 从 doc 的状态设定里取 10 组状态值和场景。
 * 好感度覆盖全部档位；swing 取 doc.state.swing 里对应方向的档。
 */
export function buildScenarios(doc, count = 10) {
  const raw = Number(count)
  const total = Math.min(SCENE_DEFS.length, Math.max(1, Number.isFinite(raw) ? Math.floor(raw) : 10))
  const indices = total >= SCENE_DEFS.length
    ? SCENE_DEFS.map((_, index) => index)
    : Array.from({ length: total }, (_, index) => (total === 1 ? 0 : Math.round((index * (SCENE_DEFS.length - 1)) / (total - 1))))
  const tiers = Array.isArray(doc?.tiers) && doc.tiers.length ? doc.tiers : []
  return indices.map((at) => {
    const def = SCENE_DEFS[at]
    const tier = tiers[Math.min(def.tier - 1, Math.max(0, tiers.length - 1))] || {}
    const affection = midOfRange(tier.range) ?? Math.round((def.tier - 0.5) * 20)
    const swing = pickSwing(doc?.state?.swing, def.swing)
    return {
      scene: def.scene,
      mood: def.mood,
      energy: def.energy,
      affection,
      tier: Number(tier.level) || def.tier,
      address: String(tier.address || ''),
      swing: swing ? { range: String(swing.range || ''), desc: String(swing.desc || ''), reaction: String(swing.reaction || '') } : null,
    }
  })
}

export function buildSimulationPrompt({ doc, scenarios }) {
  const total = scenarios.length
  const blocks = scenarios.map((item, index) => [
    `第 ${index + 1} 组`,
    `场景：${item.scene}`,
    `状态：mood ${item.mood}，energy ${item.energy}，affection ${item.affection}（第 ${item.tier} 档${item.address ? `，称呼「${item.address}」` : ''}）${item.swing ? `，swing ${item.swing.range}（${item.swing.desc}）` : ''}`,
  ].join('\n'))
  return {
    system: '你是人格测试员。只输出一个 JSON 对象，不写解释、不用 markdown 代码块。',
    prompt: [
      `按下面的人格文件和 ${total} 组状态场景，扮演这个角色写测试对话。`,
      '每组写两段：user 是对方说的一句话（20–40 字，自然、像真人）；reply 是角色回复。',
      'reply 必须体现：这一组的 mood、energy、affection 状态输出，称呼档，swing 带来的语气变化，以及场景本身。',
      '语言要求：句末按人格文件自己的句号规则（写着不用句号才不用）；省略号写 ...；口癖、句尾助词按语言指纹来。',
      '标点不要自己加限制：文件写「逗号少用但不禁用」的，需要停顿就用逗号，不要为了躲逗号把一句话拆成空格；波浪号和省略号只替代句末断句，不替代句中逗号；文件明确禁用某种标点才不用。',
      '不解释、不列点、不加旁白、不出戏。',
      `${total} 组要覆盖不同长度和情绪，不要一个模板；不用把 status 写进 reply。`,
      '',
      '人格文件：',
      JSON.stringify(doc),
      '',
      `${total} 组状态和场景：`,
      blocks.join('\n\n'),
      '',
      `只输出 JSON：{"scenes":[{"user":"...","reply":"..."}]}，正好 ${total} 项，顺序与上面一致。`,
    ].join('\n'),
  }
}
