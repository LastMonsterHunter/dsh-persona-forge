/**
 * dsh-persona-forge — 构建报告（新流程版）。
 *
 * 报告要能回答三件事：用了什么语料、规则依据什么数字、自检哪里没过。
 */

import { profileLines } from './profile.mjs'
import { RUBRIC } from './synth.mjs'

function bulletList(items, empty = '无') {
  if (!items || !items.length) return [`- ${empty}`]
  return items.map((x) => `- ${x}`)
}

export function renderForgeReport({
  personaId,
  name = '',
  version = 0,
  label = '',
  source = 'bilibili',
  brief = '',
  commentBias = 50,
  quality,
  stats,
  profile,
  rounds = [],
  validation = null,
  warnings = [],
  skipped = {},
  diff = null,
  corpus = [],
  insufficientReason = '',
  mapReduce = null,
  digest = null,
}) {
  const lines = []
  const isTieba = source === 'tieba'
  lines.push('# 人格构建报告')
  lines.push('')
  lines.push(`- persona_id：\`${personaId}\``)
  lines.push(`- 版本：${insufficientReason ? '未生成' : `v${version}`}`)
  lines.push(`- 格式：persona-kit 0~8 节`)
  lines.push(`- 来源：${isTieba ? '百度贴吧' : 'B 站'} · ${label}`)
  if (name) lines.push(`- 名称：${name}`)
  if (brief) lines.push(`- 一句话基调：${brief}`)
  if (!isTieba) lines.push(`- 评论偏向度：${commentBias}/100`)
  lines.push(`- 质量：${quality?.state || 'unknown'}`)
  if (mapReduce?.batches) lines.push(`- Map 阶段：${mapReduce.completed}/${mapReduce.batches} 批，${mapReduce.chars} 字摘要`)
  if (digest?.truncated) lines.push('- 语料预算：digest 超预算，已显式截断')
  if (insufficientReason) lines.push(`- 未生成原因：${insufficientReason}`)

  lines.push('')
  lines.push('## 语料')
  lines.push('')
  if (isTieba) {
    lines.push(`- 帖子 ${stats.videos} 个（有正文 ${stats.subtitleVideos}，有楼层 ${stats.commentVideos}）`)
    lines.push(`- 正文 ${stats.subtitleChars} 字；楼层/楼中楼 ${stats.comments} 条 / ${stats.commentChars} 字`)
  } else {
    lines.push(`- 视频 ${stats.videos} 个（有字幕 ${stats.subtitleVideos}，有评论 ${stats.commentVideos}，画面补读 ${stats.visualVideos || 0}）`)
    lines.push(`- 弹幕 ${stats.danmakuVideos || 0} 个视频 / ${stats.danmakuCount || 0} 条`)
    lines.push(`- 字幕覆盖 ${Math.round((stats.subtitleCoverage || 0) * 100)}%；字幕 ${stats.subtitleChars} 字；评论 ${stats.comments} 条 / ${stats.commentChars} 字`)
  }

  if (profile) {
    lines.push('')
    lines.push('## 语料画像（规则依据）')
    lines.push('')
    for (const line of profileLines(profile)) lines.push(line.startsWith('===') ? `\`\`\`\n${line}\n\`\`\`` : `- ${line}`)
    if (profile.bagu?.length) {
      lines.push('')
      lines.push('鱼八股命中明细：')
      for (const item of profile.bagu) lines.push(`- ${item.key}：${item.count} 次，例「${item.sample}」`)
    }
  }

  if (validation) {
    lines.push('')
    lines.push('## 结构校验')
    lines.push('')
    lines.push(validation.ok ? '- 通过' : `- 未通过 ${validation.errors.length} 项`)
    for (const error of validation.errors) lines.push(`  - ✗ ${error}`)
    for (const warning of validation.warnings) lines.push(`  - ! ${warning}`)
  }

  if (rounds.length) {
    lines.push('')
    lines.push('## 自检（固定 10 题试聊 + 评分卡）')
    lines.push('')
    for (const round of rounds) {
      lines.push(`### 第 ${round.index} 轮`)
      lines.push('')
      const check = round.check || {}
      const m = check.metrics || {}
      lines.push(`- 回答中位 ${m.median || 0} 字；口癖覆盖 ${Math.round((m.quirksPerAnswer || 0) * 100)}%；括号动作 ${m.bracketActions || 0} 处；追问 ${m.questions || 0} 次`)
      if (round.judge) {
        lines.push(`- 评审 ${round.judge.total}/16：${RUBRIC.map(([dim], i) => `${dim}${round.judge.scores?.[i] ?? 0}`).join(' ')}`)
        if (round.judge.notes?.length) for (const note of round.judge.notes) lines.push(`  - ${note}`)
      }
      lines.push(`- 结论：${round.pass ? '通过' : '未通过'}`)
      for (const issue of check.issues || []) lines.push(`  - ✗ ${issue}`)
      lines.push('')
    }
  }

  if (warnings.length) {
    lines.push('')
    lines.push('## 质量提示')
    lines.push('')
    for (const warning of warnings) lines.push(`- ${warning}`)
  }
  if (Object.keys(skipped).length) {
    lines.push('')
    lines.push('## 跳过统计')
    lines.push('')
    for (const [reason, count] of Object.entries(skipped)) lines.push(`- ${reason}：${count}`)
  }
  if (diff) {
    lines.push('')
    lines.push(`## 与上一版差异`)
    lines.push('')
    lines.push(`- 新增行 ${diff.added.length} 行，移除行 ${diff.removed.length} 行`)
  }
  lines.push('')
  lines.push(isTieba ? '## 抓取到的帖子' : '## 抓取到的视频')
  lines.push('')
  for (const video of corpus) {
    if (isTieba) {
      lines.push(`- ${video.tiebaTid || video.bvid} 《${video.title}》 @${video.up}（正文 ${(video.desc || '').length} 字，楼层 ${(video.comments || []).length}）`)
    } else {
      const coverage = Math.round((video.subtitleCoverage || 0) * 100)
      lines.push(`- ${video.bvid} 《${video.title}》 @${video.up}（字幕 ${coverage}%，评论 ${(video.comments || []).length}）`)
    }
  }
  lines.push('')
  return lines.join('\n')
}
