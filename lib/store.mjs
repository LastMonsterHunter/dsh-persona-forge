/**
 * dsh-persona-forge — 人格存档层。
 *
 * 一个 personaid 一个目录：
 *   persona.json      结构化人格（persona-kit/v1）+ 语料画像 + 自检记录
 *   persona.md        0~8 节人格文件，可直接当人格层加载
 *   system-prompt.txt 运行时系统提示词（给平台消费者）
 *   meta.yaml         状态机/平台开关
 *   report.md         构建报告
 *   corpus.jsonl      语料
 *   versions/         历史版本
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function readJson(path, fallback = null) {
  try { return JSON.parse(readFileSync(path, 'utf8')) } catch { return fallback }
}

export function writeJson(path, value) {
  ensureDir(join(path, '..'))
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function writeText(path, value) {
  ensureDir(join(path, '..'))
  writeFileSync(path, String(value ?? ''), 'utf8')
}

export function readText(path, fallback = '') {
  try { return readFileSync(path, 'utf8') } catch { return fallback }
}

export function personaFolder(root, id) {
  return join(root, 'personas', id)
}

/** 列出所有已构建人格（按更新时间倒序）。 */
export function listPersonas(root) {
  const dir = join(root, 'personas')
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir)) {
    const folder = join(dir, entry)
    try {
      if (!statSync(folder).isDirectory()) continue
    } catch { continue }
    const json = readJson(join(folder, 'persona.json'), null)
    if (!json) continue
    const mdPath = join(folder, 'persona.md')
    const md = readText(mdPath, '')
    out.push({
      id: json.id || entry,
      name: json.name || json.doc?.identity?.name || entry,
      version: Number(json.version) || 0,
      quality: json.quality?.state || 'unknown',
      source: json.corpusSource || 'bilibili',
      label: json.label || '',
      updatedAt: json.generatedAt || '',
      sections: (md.match(/^## /gm) || []).length,
      chars: Array.from(md).length,
      hasPrompt: existsSync(join(folder, 'system-prompt.txt')),
      stage: json.stage || 'done',
    })
  }
  return out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
}

/** 读一个人格的全部产物。 */
export function readPersona(root, id) {
  const folder = personaFolder(root, id)
  const json = readJson(join(folder, 'persona.json'), null)
  if (!json) return null
  const versionsDir = join(folder, 'versions')
  const versions = []
  if (existsSync(versionsDir)) {
    for (const file of readdirSync(versionsDir)) {
      const version = Number(String(file).match(/^v(\d+)\.json$/)?.[1] || 0)
      if (version) versions.push({ version, file, at: statSync(join(versionsDir, file)).mtime.toISOString() })
    }
  }
  versions.sort((a, b) => b.version - a.version)
  return {
    json,
    md: readText(join(folder, 'persona.md'), ''),
    systemPrompt: readText(join(folder, 'system-prompt.txt'), ''),
    report: readText(join(folder, 'report.md'), ''),
    meta: readText(join(folder, 'meta.yaml'), ''),
    versions,
    folder,
  }
}

/** 备份旧产物：同 id 再构建时先归档，保证可回滚。 */
export function archivePrevious(folder, previous) {
  if (!previous) return null
  const archive = ensureDir(join(folder, 'versions'))
  const version = Number(previous.version) || 1
  writeJson(join(archive, `v${version}.json`), previous)
  const md = readText(join(folder, 'persona.md'), '')
  if (md) writeText(join(archive, `v${version}.md`), md)
  return version
}

/** 落盘一个人格版本。previous 为 null 表示首版。 */
export function savePersona(root, { id, record, markdown, systemPrompt, report, corpus }) {
  const folder = ensureDir(personaFolder(root, id))
  // 迁移旧产物：没有 persona.json、只有旧 persona.md 时，先归档成 legacy-v0。
  if (!existsSync(join(folder, 'persona.json')) && existsSync(join(folder, 'persona.md'))) {
    const archive = ensureDir(join(folder, 'versions'))
    writeText(join(archive, 'legacy-v0.md'), readText(join(folder, 'persona.md')))
  }
  writeJson(join(folder, 'persona.json'), record)
  writeText(join(folder, 'persona.md'), markdown)
  writeText(join(folder, 'system-prompt.txt'), systemPrompt)
  writeText(join(folder, 'report.md'), report)
  if (Array.isArray(corpus) && corpus.length) {
    writeText(join(folder, 'corpus.jsonl'), corpus.map((x) => JSON.stringify(x)).join('\n') + '\n')
  }
  writeText(join(folder, 'meta.yaml'), [
    `persona_id: ${id}`,
    `name: ${JSON.stringify(record.name)}`,
    `version: ${record.version}`,
    `quality: ${record.quality?.state || 'unknown'}`,
    `source: dsh-persona-forge`,
    `corpus_source: ${record.corpusSource}`,
    `format: persona-kit/v1`,
    `updated: ${String(record.generatedAt || '').slice(0, 10)}`,
    'platforms:',
    '  qq:',
    '    enabled: false',
    '    mode: chat',
    '  bilibili:',
    '    enabled: false',
    '    mode: read_only',
    'notes: >',
    `  由人格工坊从「${record.label || ''}」语料生成，0~8 节格式；只写入工坊目录，不替换线上人格。`,
    '',
  ].join('\n'))
  return folder
}

/** 简单行级 diff：给界面看版本变化，不做算法优化。 */
export function diffLines(before = '', after = '') {
  const a = String(before).split('\n')
  const b = String(after).split('\n')
  const setA = new Set(a)
  const setB = new Set(b)
  return {
    removed: a.filter((line) => line.trim() && !setB.has(line)),
    added: b.filter((line) => line.trim() && !setA.has(line)),
  }
}

/** 人格 id：B 站与贴吧分开前缀，避免两边版本互相覆盖。 */
export function personaIdFor(source, label, given) {
  const base = String(given || '').trim()
    ? String(given).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 40)
    : `forge-${createHash('sha1').update(String(label || '')).digest('hex').slice(0, 8)}`
  if (source !== 'tieba') return base
  return base.startsWith('tieba-') ? base : `tieba-${base}`
}
