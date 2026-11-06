window.__ModuleLoader__.load({
  id: 'dsh-persona-forge',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const API = '/api/persona-forge'

    const DEFAULT_STATE_SPEC = {
      mood: [
        { range: '0–0.3', feature: '' },
        { range: '0.3–0.7', feature: '' },
        { range: '0.7–1', feature: '' },
      ],
      energy: [
        { range: '0–0.3', feature: '' },
        { range: '0.3–1', feature: '' },
      ],
      affection: [
        { range: '0–10', name: '', address: '' },
        { range: '10–30', name: '', address: '' },
        { range: '30–50', name: '', address: '' },
        { range: '50–70', name: '', address: '' },
        { range: '70–100', name: '', address: '' },
      ],
    }

    const MODULES = [
      ['conflicts', '矛盾点'],
      ['kaomoji', '颜文字'],
      ['stutter', '结巴'],
      ['substitution', '替换规则'],
      ['swear', '骂人用词'],
      ['agitation', '激动时的表现'],
      ['comfort', '高好感时的安慰'],
    ]

    const CSS = `
[data-pf-page]{box-sizing:border-box;width:100%;max-width:860px;height:100%;min-height:0;max-height:calc(100vh - 96px);margin:0 auto;padding:28px 26px 120px;display:flex;flex-direction:column;gap:16px;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);}
@supports (height:100dvh){[data-pf-page]{max-height:calc(100dvh - 96px);}}
[data-pf-head]{display:flex;flex-direction:column;gap:8px;}
[data-pf-title]{font-size:22px;font-weight:650;letter-spacing:-.2px;}
[data-pf-sub]{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);}
[data-pf-tabs]{display:flex;gap:8px;}
[data-pf-tab]{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-radius:999px;padding:5px 14px;font:inherit;font-size:12px;cursor:pointer;}
[data-pf-tab][data-on]{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff;}
[data-pf-card]{flex:0 0 auto;min-width:0;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;}
[data-pf-card-title]{font-size:12px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;}
[data-pf-row]{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;}
[data-pf-field]{display:flex;flex-direction:column;gap:4px;min-width:120px;flex:1;}
[data-pf-field][data-narrow]{flex:0 0 110px;}
[data-pf-label]{font-size:12px;}
[data-pf-input],[data-pf-area]{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);padding:7px 9px;font:inherit;font-size:13px;}
[data-pf-area]{min-height:64px;resize:vertical;line-height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;}
[data-pf-input]:focus,[data-pf-area]:focus{outline:none;border-color:var(--dsw-alias-brand-primary);}
[data-pf-btn]{border:1px solid #9ca3af;border-radius:8px;background:#f3f4f6;color:#111827;padding:7px 13px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;}
[data-pf-btn][data-primary]{background:#2563eb;border-color:#2563eb;color:#fff;}
[data-pf-btn][disabled]{opacity:.45;cursor:default;}
[data-pf-btn][data-small]{padding:3px 8px;font-size:11px;font-weight:500;}
[data-pf-note]{font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary);}
[data-pf-state]{font-size:12px;line-height:18px;padding:8px 10px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);white-space:pre-wrap;word-break:break-word;}
[data-pf-state][data-error]{color:var(--dsw-alias-state-error-primary);}
[data-pf-state][data-ok]{color:var(--dsw-alias-state-success-primary);}
[data-pf-log]{max-height:180px;overflow:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:17px;color:var(--dsw-alias-label-secondary);white-space:pre-wrap;}
[data-pf-pre]{max-height:420px;overflow:auto;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:17px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px;background:var(--dsw-alias-bg-base);}
[data-pf-flex]{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
[data-pf-grid]{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;}
[data-pf-pcard]{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;cursor:pointer;}
[data-pf-pcard]:hover{border-color:var(--dsw-alias-brand-primary);}
[data-pf-pname]{font-size:14px;font-weight:650;}
[data-pf-chip]{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:2px 8px;font-size:11px;color:var(--dsw-alias-label-secondary);}
[data-pf-chip][data-ok]{color:var(--dsw-alias-state-success-primary);border-color:currentColor;}
[data-pf-tier]{display:grid;grid-template-columns:52px 90px 90px 1fr 1fr 1fr 32px;gap:6px;align-items:center;font-size:11px;}
[data-pf-tier] input{font-size:11px;padding:4px 6px;}
[data-pf-spec]{display:flex;flex-direction:column;gap:3px;padding:7px 8px 6px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-base);}
[data-pf-spec-head]{display:flex;align-items:center;gap:6px;}
[data-pf-spec-head] [data-pf-label]{font-size:12px;font-weight:650;}
[data-pf-spec-head] [data-pf-btn]{padding:2px 7px;font-size:10px;border-radius:6px;}
[data-pf-spec-head] [data-pf-btn]:first-of-type{margin-left:auto;}
[data-pf-spec-row]{display:grid;gap:5px;align-items:center;}
[data-pf-spec-row] [data-pf-input]{padding:4px 6px;font-size:11px;border-radius:6px;min-height:26px;}
[data-pf-spec-row] [data-pf-num]{text-align:center;}
[data-pf-spec-row] [data-pf-btn]{padding:1px 6px;font-size:11px;line-height:20px;}
[data-pf-spec-hint]{font-size:10px;line-height:14px;color:var(--dsw-alias-label-secondary);opacity:.85;margin-top:1px;}
[data-pf-spec-cols]{display:grid;gap:5px;padding:0 0 1px;font-size:9px;line-height:12px;color:var(--dsw-alias-label-secondary);opacity:.75;}
[data-pf-spec-cols] span{text-align:center;padding-left:0;}
[data-pf-spec-dash]{text-align:center;font-size:10px;opacity:.55;line-height:26px;padding:0;}
[data-pf-mod]{display:flex;gap:6px;flex-wrap:wrap;}
[data-pf-mod] label{display:flex;gap:4px;align-items:center;font-size:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:3px 9px;cursor:pointer;}
[data-pf-mod] label[data-on]{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);}
[data-pf-sim]{border-top:1px solid var(--dsw-alias-border-l2);padding:10px 0 2px;display:flex;flex-direction:column;gap:4px;font-size:13px;line-height:19px;}
[data-pf-sim-head]{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);}
[data-pf-sim-user]{color:var(--dsw-alias-label-secondary);}
[data-pf-sim-reply]{white-space:pre-wrap;}
@media (max-width:640px){[data-pf-page]{padding:18px 14px 100px;}[data-pf-tier]{grid-template-columns:44px 1fr 1fr;}[data-pf-tier] [data-wide]{grid-column:1/-1;}}
`

    async function request(path, options) {
      const res = await fetch(API + path, {
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        ...options,
      })
      let body = {}
      try { body = await res.json() } catch {}
      if (!res.ok || body.ok === false) throw new Error(body.error || `HTTP ${res.status}`)
      return body
    }

    function Icon(props) {
      const size = props?.size || 22
      const color = props?.active ? 'var(--dsw-alias-brand-primary)' : 'currentColor'
      return h('svg', { width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true, style: { color, display: 'block' } },
        h('path', { d: 'M18 38c0-9 6-16 14-16s14 7 14 16c0 2-2 4-4 4H22c-2 0-4-2-4-4z', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5 }),
        h('circle', { cx: 26, cy: 35, r: 2.4, fill: 'currentColor' }),
        h('circle', { cx: 38, cy: 35, r: 2.4, fill: 'currentColor' }),
        h('path', { d: 'M20 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', fill: 'currentColor', opacity: .8 }),
      )
    }

    const Card = (props) => h('div', { 'data-pf-card': '' },
      props.title ? h('div', { 'data-pf-flex': '' },
        h('div', { 'data-pf-card-title': '' }, props.title),
        props.actions || null,
      ) : null,
      props.children,
    )
    const Field = (props) => h('label', { 'data-pf-field': '', ...(props.narrow ? { 'data-narrow': '' } : {}) },
      h('span', { 'data-pf-label': '' }, props.label),
      h('input', {
        'data-pf-input': '', value: props.value ?? '', placeholder: props.placeholder || '',
        type: props.type || 'text', onChange: (e) => props.onChange(e.target.value),
      }),
    )
    const Area = (props) => h('label', { 'data-pf-field': '' },
      h('span', { 'data-pf-label': '' }, props.label),
      h('textarea', {
        'data-pf-area': '', value: props.value ?? '', placeholder: props.placeholder || '',
        style: props.rows ? { minHeight: `${props.rows * 18 + 16}px` } : undefined,
        onChange: (e) => props.onChange(e.target.value),
      }),
      props.hint ? h('span', { 'data-pf-note': '' }, props.hint) : null,
    )
    const Note = (props) => h('div', { 'data-pf-note': '' }, props.children)
    const State = (props) => h('div', { 'data-pf-state': '', ...(props.kind ? { [`data-${props.kind}`]: '' } : {}) }, props.children)

    const lines = (value) => (Array.isArray(value) ? value.join('\n') : '')
    const toLines = (text) => String(text || '').split('\n').map((x) => x.trim()).filter(Boolean)

    function Lines(props) {
      return h(Area, {
        label: props.label, value: lines(props.value), rows: props.rows || 3, hint: props.hint,
        placeholder: props.placeholder || '一行一条',
        onChange: (text) => props.onChange(toLines(text)),
      })
    }

    function pairLines(items, left, right, sep = ' → ') {
      return (Array.isArray(items) ? items : []).map((x) => `${x?.[left] ?? ''}${sep}${x?.[right] ?? ''}`).join('\n')
    }

    function parsePairs(text, left, right, sep = '→') {
      return String(text || '').split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
        const at = line.indexOf(sep)
        if (at < 0) return { [left]: line, [right]: '' }
        return { [left]: line.slice(0, at).trim(), [right]: line.slice(at + sep.length).trim() }
      }).filter((x) => x[left])
    }

    function Pairs(props) {
      return h(Area, {
        label: props.label, value: pairLines(props.value, props.left, props.right, props.sep), rows: props.rows || 5,
        hint: props.hint || `一行一条，用 ${props.sep || '→'} 分隔`,
        placeholder: props.placeholder,
        onChange: (text) => props.onChange(parsePairs(text, props.left, props.right, props.sep)),
      })
    }

    function Tiers(props) {
      return h(Card, { title: '好感度分级（称呼、状态、关系共用）' },
        h('div', { 'data-pf-note': '' }, '级数 3–7 级，从低到高；改一处，§1 称呼、§4 状态、§5 关系一起变。'),
        ...(props.doc.tiers || []).map((tier, index) => h('div', { 'data-pf-tier': '', key: `tier-${index}` },
          h('span', { 'data-pf-note': '' }, `${index + 1}`),
          h('input', { 'data-pf-input': '', value: tier.range, placeholder: '0–10', onChange: (e) => props.onTier(index, 'range', e.target.value) }),
          h('input', { 'data-pf-input': '', value: tier.name, placeholder: '讨厌的人', onChange: (e) => props.onTier(index, 'name', e.target.value) }),
          h('input', { 'data-pf-input': '', value: tier.address, placeholder: '称呼', onChange: (e) => props.onTier(index, 'address', e.target.value) }),
          h('input', { 'data-pf-input': '', value: tier.stateOutput, placeholder: '这一档的状态输出', onChange: (e) => props.onTier(index, 'stateOutput', e.target.value) }),
          h('input', { 'data-pf-input': '', value: tier.relationStyle, placeholder: '这一档的关系表现', onChange: (e) => props.onTier(index, 'relationStyle', e.target.value) }),
          h('button', { 'data-pf-btn': '', 'data-small': '', disabled: props.doc.tiers.length <= 3, onClick: () => props.onRemoveTier(index) }, '×'),
        )),
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', 'data-small': '', disabled: props.doc.tiers.length >= 7, onClick: props.onAddTier }, '加一级'),
          h('button', { 'data-pf-btn': '', 'data-small': '', onClick: props.onResetTiers }, '重置为 5 级'),
        ),
      )
    }

    function numericOnly(value) {
      const text = String(value || '').replace(/[^\d.]/g, '')
      const parts = text.split('.')
      return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : text
    }

    function splitRange(range) {
      const match = String(range || '').match(/^\s*(-?\d+(?:\.\d+)?)\s*[–\-~]\s*(-?\d+(?:\.\d+)?)\s*$/)
      return match ? { min: match[1], max: match[2] } : { min: '', max: '' }
    }

    function joinRange(min, max) {
      return String(min).trim() !== '' && String(max).trim() !== '' ? `${String(min).trim()}–${String(max).trim()}` : ''
    }

    function SpecRows(props) {
      const { list, fields } = props
      const update = (index, key, value) => {
        const next = list.map((item) => ({ ...item }))
        if (key === 'min' || key === 'max') {
          const parsed = splitRange(next[index].range)
          const clean = numericOnly(value)
          const min = key === 'min' ? clean : (next[index].min ?? parsed.min)
          const max = key === 'max' ? clean : (next[index].max ?? parsed.max)
          next[index].min = min
          next[index].max = max
          next[index].range = joinRange(min, max)
        } else {
          next[index][key] = value
        }
        props.onChange(next)
      }
      const columns = []
      fields.forEach((field) => {
        columns.push(['min', 'max'].includes(field.key) ? '62px' : 'minmax(0,1fr)')
        if (field.key === 'min') columns.push('10px')
      })
      columns.push('24px')
      const colTemplate = columns.join(' ')
      return h('div', { 'data-pf-spec': '' },
        h('div', { 'data-pf-spec-head': '' },
          h('span', { 'data-pf-label': '' }, props.label),
          h('button', { 'data-pf-btn': '', 'data-small': '', disabled: list.length >= props.max, onClick: props.onAdd }, '加一级'),
          h('button', { 'data-pf-btn': '', 'data-small': '', onClick: props.onReset }, '重置'),
        ),
        h('div', { 'data-pf-spec-cols': '', style: { gridTemplateColumns: colTemplate } },
          fields.map((field, index) => h(React.Fragment, { key: field.key },
            field.key === 'max' && fields[index - 1]?.key === 'min' ? h('span', { 'data-pf-spec-dash': '' }, '') : null,
            h('span', null, field.label || ''),
          )),
          h('span', null, ''),
        ),
        list.map((item, index) => {
          const parsed = splitRange(item.range)
          return h('div', { 'data-pf-spec-row': '', style: { gridTemplateColumns: colTemplate }, key: `${props.label}-${index}` },
            fields.map((field, fieldIndex) => {
              const value = field.key === 'min'
                ? (item.min ?? parsed.min)
                : field.key === 'max'
                  ? (item.max ?? parsed.max)
                  : item[field.key]
              const input = h('input', {
                key: field.key,
                'data-pf-input': '',
                inputMode: 'decimal',
                pattern: '[0-9]*[.]?[0-9]*',
                'aria-label': field.label || field.placeholder,
                ...(field.key === 'min' || field.key === 'max' ? { 'data-pf-num': '' } : {}),
                value: value || '',
                placeholder: field.placeholder,
                onChange: (e) => update(index, field.key, e.target.value),
              })
              if (field.key === 'max' && fields[fieldIndex - 1]?.key === 'min') {
                return h(React.Fragment, { key: field.key },
                  h('span', { 'data-pf-spec-dash': '' }, '—'),
                  input,
                )
              }
              return input
            }),
            h('button', { 'data-pf-btn': '', 'data-small': '', disabled: list.length <= props.min, onClick: () => props.onRemove(index) }, '×'),
          )
        }),
        h('span', { 'data-pf-spec-hint': '' }, props.hint),
      )
    }

    function CreateView(props) {
      const { form, setForm, busy, error } = props
      const field = (key) => (value) => setForm({ [key]: value })
      const setSpec = (group, list) => setForm({ stateSpec: { ...form.stateSpec, [group]: list } })
      const emptySpec = (group) => group === 'affection' ? { range: '', min: '', max: '', name: '', address: '' } : { range: '', min: '', max: '', feature: '' }
      const addSpec = (group, max) => { if (form.stateSpec[group].length < max) setSpec(group, [...form.stateSpec[group], emptySpec(group)]) }
      const removeSpec = (group, index, min) => { if (form.stateSpec[group].length > min) setSpec(group, form.stateSpec[group].filter((_, i) => i !== index)) }
      const resetSpec = (group) => setSpec(group, [...DEFAULT_STATE_SPEC[group]])
      const canStart = !busy && (String(form.personalityKeywords).trim() || String(form.identityKeywords).trim())
      const canDescribe = !busy && (String(form.personalityKeywords).trim() || String(form.identityKeywords).trim())
      return h(React.Fragment, null,
        h(Card, { title: '关键词' },
          h('div', { 'data-pf-row': '' },
            h(Field, { label: '性格关键词', value: form.personalityKeywords, placeholder: '例如：毒舌 护短 慢热', onChange: field('personalityKeywords') }),
            h(Field, { label: '身份关键词', value: form.identityKeywords, placeholder: '例如：学姐 击剑手 书店店长', onChange: field('identityKeywords') }),
          ),
          h(Note, null, '性格决定说话方式，身份决定场景和关系；空格或逗号分隔。'),
        ),
        h(Card, { title: '一句话描述' },
          h(Area, {
            label: '可以手动改，生成时会作为人格的定位', value: form.description, rows: 3,
            placeholder: '例如：嘴毒但护短的研二学姐，要的是对方认真，怕的是自己只剩刻薄',
            onChange: field('description'),
          }),
          h('div', { 'data-pf-flex': '' },
            h('button', { 'data-pf-btn': '', disabled: !canDescribe, onClick: () => props.onDescribe('from') }, '生成描述'),
            h('button', { 'data-pf-btn': '', disabled: busy, onClick: () => props.onDescribe('random') }, '随机生成'),
            h(Note, null, '生成描述按上面两个关键词写；随机生成会同时回填关键词和描述。'),
          ),
        ),
        h(Card, { title: '补充设定' },
          h(Area, {
            label: '其他设定', value: form.notes, rows: 3,
            placeholder: '名字、年龄、身份细节、她怎么称呼你、绝对边界；不确定的可以留空',
            onChange: field('notes'),
          }),
          h('div', { 'data-pf-row': '' },
            h(Area, { label: '喜欢的', value: form.likes, rows: 2, placeholder: '猫、推理小说、圣诞节', onChange: field('likes') }),
            h(Area, { label: '讨厌的', value: form.dislikes, rows: 2, placeholder: '拍马屁、集体跑步、愚人节', onChange: field('dislikes') }),
          ),
          h(Note, null, '喜好 / 厌恶会写进人格的状态节，生成后仍可改。'),
        ),
        h(Card, { title: '状态分级（生成前可调）' },
          h(Note, null, 'mood / energy 每级可以写特征，留空由模型补；好感度每级可以写关系和称呼，留空由模型补；心情波动由模型按关键词和描述生成，生成后在编辑页调。'),
          h(SpecRows, {
            label: '心情 mood', list: form.stateSpec.mood, min: 2, max: 6,
            fields: [{ key: 'min', label: '≥ 下限', placeholder: '0' }, { key: 'max', label: '< 上限', placeholder: '0.3' }, { key: 'feature', label: '特征', placeholder: '可空' }],
            hint: '0 = 极度糟糕，1 = 极度好；下限含本档（≥），上限不含（<）；相邻档可共用边界',
            onChange: (v) => setSpec('mood', v), onAdd: () => addSpec('mood', 6),
            onRemove: (i) => removeSpec('mood', i, 2), onReset: () => resetSpec('mood'),
          }),
          h(SpecRows, {
            label: '精力 energy', list: form.stateSpec.energy, min: 2, max: 6,
            fields: [{ key: 'min', label: '≥ 下限', placeholder: '0' }, { key: 'max', label: '< 上限', placeholder: '0.3' }, { key: 'feature', label: '特征', placeholder: '可空' }],
            hint: '0 = 精力全无，1 = 精神满满；下限含本档（≥），上限不含（<）；相邻档可共用边界',
            onChange: (v) => setSpec('energy', v), onAdd: () => addSpec('energy', 6),
            onRemove: (i) => removeSpec('energy', i, 2), onReset: () => resetSpec('energy'),
          }),
          h(SpecRows, {
            label: '好感度 affection', list: form.stateSpec.affection, min: 3, max: 7,
            fields: [{ key: 'min', label: '≥ 下限', placeholder: '0' }, { key: 'max', label: '< 上限', placeholder: '10' }, { key: 'name', label: '关系名', placeholder: '可空' }, { key: 'address', label: '称呼', placeholder: '可空' }],
            hint: '0 = 讨厌，100 = 喜欢；下限含本档（≥），上限不含（<）；相邻档共用边界（如 10 归下一档），关系必须逐级更亲近',
            onChange: (v) => setSpec('affection', v), onAdd: () => addSpec('affection', 7),
            onRemove: (i) => removeSpec('affection', i, 3), onReset: () => resetSpec('affection'),
          }),
        ),
        error ? h(State, { kind: 'error' }, error) : null,
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', 'data-primary': '', disabled: !canStart, onClick: props.onGenerate }, '生成人格'),
          h('button', { 'data-pf-btn': '', disabled: busy, onClick: props.onLibrary }, '打开人格库'),
          props.hasLast ? h('button', { 'data-pf-btn': '', disabled: busy, onClick: props.onResume }, '恢复最近一次生成') : null,
          h(Note, null, '生成会先按关键词联网检索资料，再写 0~8 节人格文件。'),
        ),
      )
    }

    function GeneratingView(props) {
      const gen = props.gen || { status: 'starting', logs: [] }
      const labels = {
        starting: '准备中', searching: '联网检索资料', drafting: '写人格设定', repairing: '结构回炉', done: '完成', error: '失败', cancelled: '已取消',
      }
      const logs = (gen.logs || []).map((x) => `[${new Date(x.at).toLocaleTimeString()}] ${x.message}`).join('\n')
      return h(Card, { title: '生成中' },
        h(State, null, `${labels[gen.status] || gen.status}\n关键词：${(gen.keywords || []).join(' / ') || '—'}\n资料：${(gen.sources || []).length} 条`),
        h('div', { 'data-pf-log': '' }, logs || '（暂无日志）'),
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', onClick: props.onCancel }, '取消'),
          gen.status === 'error' ? h('button', { 'data-pf-btn': '', 'data-primary': '', onClick: props.onBack }, '返回修改') : null,
        ),
      )
    }

    function SwingEditor(props) {
      const list = props.items || []
      const update = (index, key, value) => {
        const next = list.map((item) => ({ ...item }))
        next[index][key] = value
        props.onChange(next)
      }
      return h('div', { 'data-pf-field': '' },
        h('div', { 'data-pf-flex': '' },
          h('span', { 'data-pf-label': '' }, '心情波动分级'),
          h('button', { 'data-pf-btn': '', 'data-small': '', disabled: list.length >= 10, onClick: () => props.onChange([...list, { range: '', desc: '', reaction: '' }]) }, '加一级'),
        ),
        list.map((item, index) => h('div', { 'data-pf-flex': '', key: `swing-${index}` },
          h('input', { 'data-pf-input': '', value: item.range || '', placeholder: '范围，如 -46~-70', onChange: (e) => update(index, 'range', e.target.value) }),
          h('input', { 'data-pf-input': '', value: item.desc || '', placeholder: '什么话算这一档', onChange: (e) => update(index, 'desc', e.target.value) }),
          h('input', { 'data-pf-input': '', value: item.reaction || '', placeholder: '反应', onChange: (e) => update(index, 'reaction', e.target.value) }),
          h('button', { 'data-pf-btn': '', 'data-small': '', disabled: list.length <= 3, onClick: () => props.onChange(list.filter((_, i) => i !== index)) }, '×'),
        )),
        h('span', { 'data-pf-note': '' }, '3~10 级；范围、什么话算这一档、反应都可以改。'),
      )
    }

    function EditView(props) {
      const { doc, update, modules, busy, message, error, saved } = props
      const set = (fn) => update(fn)
      const tier = (index, key, value) => set((d) => { d.tiers[index][key] = value })
      const addTier = () => set((d) => {
        if (d.tiers.length >= 7) return
        const last = d.tiers[d.tiers.length - 1]
        d.tiers.push({ level: d.tiers.length + 1, range: '', name: '亲近的人', address: '', stateOutput: '', relationStyle: '' })
        if (!last) return
      })
      const removeTier = (index) => set((d) => { if (d.tiers.length > 3) d.tiers.splice(index, 1); d.tiers.forEach((t, i) => { t.level = i + 1 }) })
      const resetTiers = () => set((d) => {
        const ranges = ['0–10', '11–30', '31–50', '51–70', '70–100']
        const names = ['讨厌的人', '疏远的人', '陌生人', '熟人', '亲近的人']
        d.tiers = ranges.map((range, i) => ({ level: i + 1, range, name: names[i], address: '', stateOutput: '', relationStyle: '' }))
      })
      return h(React.Fragment, null,
        message ? h(State, { kind: 'ok' }, message) : null,
        error ? h(State, { kind: 'error' }, error) : null,
        h(Card, { title: '基本信息' },
          h('div', { 'data-pf-row': '' },
            h(Field, { label: '人格名', value: doc.name, onChange: (v) => set((d) => { d.name = v; d.identity.name = v }) }),
            h(Field, { label: '关键词', value: (doc.keywords || []).join(' '), onChange: (v) => set((d) => { d.keywords = toLines(v.replace(/[,，]/g, ' ')) }) }),
          ),
          h(Field, { label: '一句话定位', value: doc.positioning, onChange: (v) => set((d) => { d.positioning = v }) }),
        ),
        h(Card, { title: '可选模块' },
          h('div', { 'data-pf-mod': '' }, MODULES.map(([key, label]) => h('label', {
            key, ...(doc.modules[key] ? { 'data-on': '' } : {}),
            onClick: (e) => { e.preventDefault(); set((d) => { d.modules[key] = !d.modules[key] }) },
          }, h('input', { type: 'checkbox', checked: Boolean(doc.modules[key]), readOnly: true }), label))),
          h(Note, null, '生成时已按关键词判断；这里可以改，关掉的模块不会写进文件。'),
        ),
        h(Card, { title: '0 · 一句话内核' },
          h(Area, { label: '她是她是谁、要什么、怕什么', value: doc.core, rows: 3, onChange: (v) => set((d) => { d.core = v }) }),
        ),
        h(Tiers, { doc, onTier: tier, onAddTier: addTier, onRemoveTier: removeTier, onResetTiers: resetTiers }),
        h(Card, { title: '1 · 身份' },
          h('div', { 'data-pf-row': '' },
            h(Field, { label: '名字', value: doc.identity.name, onChange: (v) => set((d) => { d.identity.name = v }) }),
            h(Field, { label: '自称', value: doc.identity.selfRef, onChange: (v) => set((d) => { d.identity.selfRef = v }) }),
            h(Field, { label: '年龄感', value: doc.identity.age, onChange: (v) => set((d) => { d.identity.age = v }) }),
          ),
          h(Field, { label: '身份设定', value: doc.identity.setting, onChange: (v) => set((d) => { d.identity.setting = v }) }),
          h(Lines, { label: '绝对边界', value: doc.identity.boundaries, onChange: (v) => set((d) => { d.identity.boundaries = v }) }),
        ),
        h(Card, { title: '2 · 性格' },
          h(Pairs, { label: '核心倾向', value: doc.character.traits, left: 'word', right: 'behavior', hint: '一行一条：词 → 可观察的行为', onChange: (v) => set((d) => { d.character.traits = v }) }),
          h(Lines, { label: '缺点', value: doc.character.flaws, onChange: (v) => set((d) => { d.character.flaws = v }) }),
          h(Pairs, { label: '触发规则', value: doc.character.triggers, left: 'when', right: 'then', hint: '一行一条：场景 → 反应', onChange: (v) => set((d) => { d.character.triggers = v }) }),
          h('div', { 'data-pf-card-title': '' }, '人格专属特点'),
          modules.conflicts ? h(Lines, { label: '矛盾点', value: doc.character.conflicts, onChange: (v) => set((d) => { d.character.conflicts = v }) }) : null,
          h(Pairs, { label: '其他专属特点', value: doc.character.special, left: 'name', right: 'description', hint: '一行一条：特点 → 触发和表现；只写这个角色才有的', onChange: (v) => set((d) => { d.character.special = v }) }),
        ),
        h(Card, { title: '3 · 语言指纹' },
          h(Area, { label: '核心基调', value: doc.voice.base, rows: 2, onChange: (v) => set((d) => { d.voice.base = v }) }),
          h('div', { 'data-pf-row': '' },
            h(Field, { label: '句长描述', value: doc.voice.sentence.typical, onChange: (v) => set((d) => { d.voice.sentence.typical = v }) }),
            h(Field, { label: '最短字数', narrow: true, value: doc.voice.sentence.min, onChange: (v) => set((d) => { d.voice.sentence.min = Number(v) || 0 }) }),
            h(Field, { label: '最长字数', narrow: true, value: doc.voice.sentence.max, onChange: (v) => set((d) => { d.voice.sentence.max = Number(v) || 0 }) }),
          ),
          h(Field, { label: '底线', value: doc.voice.bottomLine, onChange: (v) => set((d) => { d.voice.bottomLine = v }) }),
          h(Lines, { label: '口癖', value: doc.voice.quirks, rows: 2, onChange: (v) => set((d) => { d.voice.quirks = v }) }),
          h(Lines, { label: '句尾助词', value: doc.voice.endings.map((x) => `${x.word}: ${x.use}`), rows: 3, hint: '一行一条：助词: 用途', onChange: (v) => set((d) => { d.voice.endings = v.map((line) => { const [word, use] = line.split(/[:：]/); return { word: (word || '').trim(), use: (use || '').trim() } }) }) }),
          h(Field, { label: '标点习惯', value: doc.voice.punctuation, onChange: (v) => set((d) => { d.voice.punctuation = v }) }),
          h('div', { 'data-pf-row': '' },
            h(Field, { label: '表情上限', narrow: true, value: doc.voice.emoji.max, onChange: (v) => set((d) => { d.voice.emoji.max = Number(v) || 0 }) }),
            h(Field, { label: '表情触发', value: doc.voice.emoji.when, onChange: (v) => set((d) => { d.voice.emoji.when = v }) }),
            h(Field, { label: '表情方向', value: doc.voice.emoji.direction, onChange: (v) => set((d) => { d.voice.emoji.direction = v }) }),
          ),
          modules.kaomoji ? h(React.Fragment, null,
            h(Field, { label: '颜文字条件', value: doc.voice.kaomoji.when, onChange: (v) => set((d) => { d.voice.kaomoji.when = v }) }),
            h(Lines, { label: '颜文字样式', value: doc.voice.kaomoji.styles, rows: 2, onChange: (v) => set((d) => { d.voice.kaomoji.styles = v }) }),
          ) : null,
          h(Field, { label: '结尾规则', value: doc.voice.endingRule, onChange: (v) => set((d) => { d.voice.endingRule = v }) }),
          modules.substitution ? h(Lines, { label: '替换规则', value: doc.voice.substitution, rows: 2, onChange: (v) => set((d) => { d.voice.substitution = v }) }) : null,
          modules.stutter ? h(Field, { label: '结巴规则', value: doc.voice.stutter, onChange: (v) => set((d) => { d.voice.stutter = v }) }) : null,
          h(Field, { label: '引号习惯', value: doc.voice.quotes, onChange: (v) => set((d) => { d.voice.quotes = v }) }),
          h(Lines, { label: '禁用词', value: doc.voice.banned, rows: 2, onChange: (v) => set((d) => { d.voice.banned = v }) }),
          modules.swear ? h(React.Fragment, null,
            h(Field, { label: '骂人触发', value: doc.voice.swear.trigger, onChange: (v) => set((d) => { d.voice.swear.trigger = v }) }),
            h(Lines, { label: '可用词', value: doc.voice.swear.words, rows: 2, onChange: (v) => set((d) => { d.voice.swear.words = v }) }),
            h(Field, { label: '句式', value: doc.voice.swear.style, onChange: (v) => set((d) => { d.voice.swear.style = v }) }),
            h(Field, { label: '不碰', value: doc.voice.swear.avoid, onChange: (v) => set((d) => { d.voice.swear.avoid = v }) }),
            h(Field, { label: '收手', value: doc.voice.swear.stop, onChange: (v) => set((d) => { d.voice.swear.stop = v }) }),
          ) : null,
          h('div', { 'data-pf-card-title': '' }, '人格专属特点'),
          h(Note, null, '颜文字、结巴、替换规则、骂人用词也在这一组；只留这个角色真有的。'),
          h(Pairs, { label: '其他专属特点', value: doc.voice.special, left: 'name', right: 'description', hint: '一行一条：特点 → 触发和表现', onChange: (v) => set((d) => { d.voice.special = v }) }),
          h(Lines, { label: '正例', value: doc.voice.good, rows: 5, onChange: (v) => set((d) => { d.voice.good = v }) }),
          h(Area, {
            label: '反例', rows: 3, value: doc.voice.bad.map((x) => `${x.text} → ${x.why}`).join('\n'),
            hint: '一行一条：句子 → 为什么不像',
            onChange: (v) => set((d) => { d.voice.bad = parsePairs(v, 'text', 'why') }),
          }),
        ),
        h(Card, { title: '4 · 状态' },
          h(Pairs, { label: '状态映射', value: doc.state.moodMap, left: 'cond', right: 'output', sep: '|', rows: 6, hint: '一行一条：条件 | 输出特征', onChange: (v) => set((d) => { d.state.moodMap = v }) }),
          h(SwingEditor, { items: doc.state.swing, onChange: (v) => set((d) => { d.state.swing = v }) }),
          modules.agitation ? h(React.Fragment, null,
            h(Field, { label: '激动触发', value: doc.state.agitation.trigger, onChange: (v) => set((d) => { d.state.agitation.trigger = v }) }),
            h(Area, { label: '激动表现', rows: 2, value: doc.state.agitation.forms, onChange: (v) => set((d) => { d.state.agitation.forms = v }) }),
            h(Field, { label: '激动时的结巴', value: doc.state.agitation.stutter, onChange: (v) => set((d) => { d.state.agitation.stutter = v }) }),
            h(Field, { label: '收束', value: doc.state.agitation.close, onChange: (v) => set((d) => { d.state.agitation.close = v }) }),
          ) : null,
          h(Lines, { label: '喜欢', value: doc.state.likes, rows: 3, onChange: (v) => set((d) => { d.state.likes = v }) }),
          h(Lines, { label: '讨厌', value: doc.state.dislikes, rows: 3, onChange: (v) => set((d) => { d.state.dislikes = v }) }),
          h(Field, { label: '好感规则', value: doc.state.affinityRule, onChange: (v) => set((d) => { d.state.affinityRule = v }) }),
        ),
        h(Card, { title: '5 · 关系' },
          h(Field, { label: '亲密度门槛', value: doc.relations.gates, onChange: (v) => set((d) => { d.relations.gates = v }) }),
          h(Field, { label: '记忆钩子', value: doc.relations.hooks, onChange: (v) => set((d) => { d.relations.hooks = v }) }),
        ),
        h(Card, { title: '6 · 行为规则' },
          h(Field, { label: '主动开口', value: doc.rules.speak, onChange: (v) => set((d) => { d.rules.speak = v }) }),
          h(Field, { label: '被已读不回', value: doc.rules.ignored, onChange: (v) => set((d) => { d.rules.ignored = v }) }),
          h(Field, { label: '拒绝方式', value: doc.rules.refuse, onChange: (v) => set((d) => { d.rules.refuse = v }) }),
          h(Field, { label: '对方难过的固定动作', value: doc.rules.comfortAction, onChange: (v) => set((d) => { d.rules.comfortAction = v }) }),
          h(Field, { label: '被要求出戏时', value: doc.rules.ooc, onChange: (v) => set((d) => { d.rules.ooc = v }) }),
          h(Field, { label: '被问是不是 AI', value: doc.rules.ai, onChange: (v) => set((d) => { d.rules.ai = v }) }),
          h(Field, { label: '被问内部设定', value: doc.rules.internal, onChange: (v) => set((d) => { d.rules.internal = v }) }),
          h(Area, { label: '情绪保护红线', rows: 2, value: doc.rules.crisis, onChange: (v) => set((d) => { d.rules.crisis = v }) }),
          h('div', { 'data-pf-card-title': '' }, '人格专属特点'),
          modules.comfort ? h(Area, { label: '高好感安慰', rows: 2, value: doc.rules.comfort, onChange: (v) => set((d) => { d.rules.comfort = v }) }) : null,
          h(Pairs, { label: '人格专属特点', value: doc.rules.special, left: 'name', right: 'description', hint: '一行一条：特点 → 触发和表现', onChange: (v) => set((d) => { d.rules.special = v }) }),
        ),
        h(Card, { title: '7 · 元规则' },
          h(Field, { label: '优先级', value: doc.meta.priority, onChange: (v) => set((d) => { d.meta.priority = v }) }),
          h(Lines, { label: 'OOC 禁令', value: doc.meta.oocBans, rows: 3, onChange: (v) => set((d) => { d.meta.oocBans = v }) }),
          h(Field, { label: '平台例外', value: doc.meta.platformException, onChange: (v) => set((d) => { d.meta.platformException = v }) }),
        ),
        h(Card, { title: '8 · 自检与掉线兜底' },
          h(Lines, { label: '自检清单', value: doc.checklist, rows: 5, onChange: (v) => set((d) => { d.checklist = v }) }),
          h(Field, { label: '掉线兜底', value: doc.fallback, onChange: (v) => set((d) => { d.fallback = v }) }),
        ),
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', 'data-primary': '', disabled: busy || !props.dirty, onClick: props.onSave }, busy ? '处理中…' : (saved ? (props.dirty ? '保存修改（新版本）' : '已保存') : '保存人格')),
          h('button', { 'data-pf-btn': '', disabled: busy || !props.md, onClick: props.onFile }, '查看完整文件'),
          h('button', { 'data-pf-btn': '', disabled: busy, onClick: props.onBack }, '回到新建'),
          h('button', { 'data-pf-btn': '', disabled: busy, onClick: props.onSimulate }, '模拟对话'),
        ),
        h('div', { 'data-pf-flex': '' },
          h('span', { 'data-pf-label': '' }, '模拟次数'),
          h('select', {
            'data-pf-input': '',
            style: { width: '84px', flex: '0 0 auto' },
            value: props.simCount,
            onChange: (e) => props.onCountChange(Number(e.target.value)),
          }, Array.from({ length: 10 }, (_, i) => h('option', { key: i + 1, value: i + 1 }, `${i + 1} 组`))),
          h('span', { 'data-pf-note': '' }, '1–10 组，默认 10'),
        ),
        error ? h(State, { kind: 'error' }, error) : null,
        props.simulation ? h(Card, { title: `模拟对话（${(props.simulation.scenarios || []).length} 组，基于 ${props.simulation.id} · v${props.simulation.version}）` },
          h('div', { 'data-pf-flex': '' },
            h('button', { 'data-pf-btn': '', 'data-small': '', disabled: busy, onClick: props.onSimulate }, '重新生成'),
            h('button', { 'data-pf-btn': '', 'data-small': '', onClick: props.onCloseSimulation }, '关闭'),
            h(Note, null, '基于已保存版本，不含当前未保存的修改'),
          ),
          ...(props.simulation.scenarios || []).map((item, index) => h('div', { 'data-pf-sim': '', key: `sim-${index}` },
            h('div', { 'data-pf-sim-head': '' }, `${index + 1}. mood ${item.mood} · energy ${item.energy} · affection ${item.affection}${item.swing?.range ? ` · swing ${item.swing.range}` : ''} · ${item.scene}`),
            h('div', { 'data-pf-sim-user': '' }, `用户：${item.user}`),
            h('div', { 'data-pf-sim-reply': '' }, `角色：${item.reply}`),
          )),
        ) : null,
        saved
          ? (props.dirty
            ? h(Note, null, `有未保存的修改：${saved.id} · 当前 v${saved.version}`)
            : h(State, { kind: 'ok' }, `已保存：${saved.id} · v${saved.version}`))
          : (props.dirty ? h(Note, null, '新人格还没保存') : null),
      )
    }

    function FileView(props) {
      return h(React.Fragment, null,
        h(Card, { title: '完整人格文件' },
          h('div', { 'data-pf-flex': '' },
            h('button', { 'data-pf-btn': '', onClick: props.onBack }, '返回编辑'),
          ),
          h('div', { 'data-pf-pre': '' }, props.md || '（还没有保存）'),
        ),
      )
    }

    function LibraryView(props) {
      return h(React.Fragment, null,
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', onClick: props.onRefresh }, '刷新'),
          h('button', { 'data-pf-btn': '', onClick: props.onCreate }, '新建人格'),
          h(Note, null, `共 ${props.personas.length} 份`),
        ),
        props.personas.length
          ? h('div', { 'data-pf-grid': '' }, props.personas.map((persona) => h('div', {
            key: persona.id, 'data-pf-pcard': '', onClick: () => props.onOpen(persona.id),
          },
            h('div', { 'data-pf-pname': '' }, persona.name || persona.id),
            h('div', { 'data-pf-note': '' }, `v${persona.version} · ${persona.id}`),
            h('div', { 'data-pf-note': '' }, persona.updatedAt ? new Date(persona.updatedAt).toLocaleString() : ''),
          )))
          : h(Card, null, h(Note, null, '还没有生成过人格。')),
      )
    }

    function DetailView(props) {
      const detail = props.detail
      if (!detail) return h(Card, null, h(Note, null, '读取中…'))
      const json = detail.json || {}
      return h(React.Fragment, null,
        h('div', { 'data-pf-flex': '' },
          h('button', { 'data-pf-btn': '', onClick: props.onBack }, '返回人格库'),
          h('button', { 'data-pf-btn': '', 'data-primary': '', disabled: props.busy, onClick: () => props.onEdit(detail) }, '编辑'),
        ),
        props.message ? h(State, { kind: 'ok' }, props.message) : null,
        h(Card, { title: '人格' },
          h(State, { kind: 'ok' }, `${json.name || detail.id} · v${json.version}\n${json.doc?.core || ''}`),
          h(Note, null, `关键词：${(json.keywords || []).join(' / ')} · 资料 ${(json.sources || []).length} 条`),
        ),
        h(Card, { title: '完整人格文件' }, h('div', { 'data-pf-pre': '' }, detail.md || '')),
      )
    }

    function Panel() {
      const [view, setView] = React.useState('create')
      const [form, setFormState] = React.useState({
        personalityKeywords: '', identityKeywords: '', description: '', notes: '',
        likes: '', dislikes: '', stateSpec: JSON.parse(JSON.stringify(DEFAULT_STATE_SPEC)),
      })
      const [gen, setGen] = React.useState(null)
      const [doc, setDoc] = React.useState(null)
      const [md, setMd] = React.useState('')
      const [saved, setSaved] = React.useState(null)
      const [savedDoc, setSavedDoc] = React.useState('')
      const [simulation, setSimulation] = React.useState(null)
      const [simCount, setSimCount] = React.useState(10)
      const [personas, setPersonas] = React.useState([])
      const [detail, setDetail] = React.useState(null)
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState('')
      const [message, setMessage] = React.useState('')
      const [hasLast, setHasLast] = React.useState(false)

      React.useEffect(() => {
        request('/generate/status').then((body) => { if (body.gen?.doc) setHasLast(true) }).catch(() => {})
      }, [])

      const resumeLast = async () => {
        setBusy(true); setError('')
        try {
          const body = await request('/generate/status')
          const g = body.gen
          if (!g?.doc) { setError('没有可恢复的生成'); return }
          setGen(g); setDoc(g.doc); setMd(g.md || ''); setSaved(null); setSavedDoc(''); setSimulation(null)
          setMessage('已恢复最近一次生成'); setView('edit')
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const setForm = (patch) => setFormState((prev) => ({ ...prev, ...patch }))
      const update = (fn) => { setMessage(''); setDoc((prev) => { const next = JSON.parse(JSON.stringify(prev)); fn(next); return next }) }

      const startGenerate = async () => {
        setError(''); setMessage(''); setGen(null); setBusy(true); setView('generating')
        try {
          await request('/generate', {
            method: 'POST',
            body: JSON.stringify({
              personalityKeywords: form.personalityKeywords,
              identityKeywords: form.identityKeywords,
              description: form.description,
              notes: form.notes,
              likes: form.likes,
              dislikes: form.dislikes,
              stateSpec: form.stateSpec,
            }),
          })
        } catch (e) {
          setError(String(e.message || e)); setBusy(false); setView('create')
        }
      }

      React.useEffect(() => {
        if (view !== 'generating') return
        let stop = false
        const timer = setInterval(async () => {
          if (stop) return
          try {
            const body = await request('/generate/status')
            const g = body.gen
            setGen(g)
            if (!g) return
            if (g.status === 'done') {
              setDoc(g.doc); setMd(g.md); setSaved(null); setSavedDoc(''); setSimulation(null); setBusy(false); setView('edit')
            } else if (g.status === 'error' || g.status === 'cancelled') {
              setBusy(false)
            }
          } catch (e) { setError(String(e.message || e)) }
        }, 1200)
        return () => { stop = true; clearInterval(timer) }
      }, [view])

      const describe = async (mode) => {
        setBusy(true); setError('')
        try {
          const body = await request('/describe', {
            method: 'POST',
            body: JSON.stringify({
              personalityKeywords: form.personalityKeywords,
              identityKeywords: form.identityKeywords,
              mode,
            }),
          })
          if (mode === 'random') {
            setForm({
              description: body.description || '',
              personalityKeywords: (body.personality || []).join(' '),
              identityKeywords: (body.identity || []).join(' '),
            })
          } else {
            setForm({ description: body.description || '' })
          }
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const cancelGenerate = async () => {
        try { await request('/generate/cancel', { method: 'POST', body: '{}' }) } catch (e) { setError(String(e.message || e)) }
      }

      const save = async () => {
        setBusy(true); setError(''); setMessage('')
        try {
          let nextDoc = doc
          let note = ''
          try {
            const baseDoc = savedDoc ? JSON.parse(savedDoc) : null
            const rec = await request('/reconcile', { method: 'POST', body: JSON.stringify({ doc, baseDoc }) })
            if (rec.ok) {
              nextDoc = rec.doc
              if (JSON.stringify(nextDoc) !== JSON.stringify(doc)) setDoc(nextDoc)
              const fixed = (rec.adjusted || []).filter(Boolean)
              if (fixed.length) note = `校验：补全或修正 ${fixed.length} 处`
              else if (!rec.skipped) note = '校验通过'
            } else {
              note = `一致性校验失败：${rec.error || '未知错误'}`
            }
          } catch (e) {
            note = `一致性校验失败：${e.message || e}`
          }
          const body = await request('/save', { method: 'POST', body: JSON.stringify({ id: saved?.id, doc: nextDoc, sources: gen?.sources || [] }) })
          setSaved({ id: body.id, version: body.version })
          setSavedDoc(JSON.stringify(nextDoc))
          setMd(body.md)
          setMessage(`已保存：${body.id} · v${body.version}${note ? `｜${note}` : ''}`)
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const simulate = async () => {
        if (!saved?.id) { setError('先保存人格，模拟对话基于已保存的版本'); return }
        setBusy(true); setError(''); setMessage('')
        try {
          const body = await request('/simulate', { method: 'POST', body: JSON.stringify({ id: saved.id, count: simCount }) })
          setSimulation({ id: body.id, version: body.version, scenarios: body.scenarios || [] })
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const openFile = async () => {
        setBusy(true); setError('')
        try {
          const body = await request('/preview', { method: 'POST', body: JSON.stringify({ doc }) })
          setMd(body.md)
          setView('file')
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const loadLibrary = async () => {
        setBusy(true); setError('')
        try {
          const body = await request('/personas')
          setPersonas(body.personas || [])
          setView('library'); setDetail(null)
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const openDetail = async (id) => {
        setBusy(true); setError(''); setMessage('')
        try {
          const body = await request(`/personas/detail?id=${encodeURIComponent(id)}`)
          setDetail(body); setView('detail')
        } catch (e) { setError(String(e.message || e)) } finally { setBusy(false) }
      }

      const editDetail = (detailBody) => {
        const json = detailBody.json || {}
        if (!json.doc) { setError('这份人格没有结构化文档，无法分区编辑'); return }
        setDoc(json.doc); setMd(detailBody.md || ''); setSaved({ id: json.id || detailBody.id, version: json.version || 1 })
        setSavedDoc(JSON.stringify(json.doc))
        setSimulation(null)
        setView('edit'); setMessage('')
      }

      const header = h('div', { 'data-pf-head': '' },
        h('div', { 'data-pf-title': '' }, '人格工坊'),
        h('div', { 'data-pf-sub': '' }, '输入关键词 → 联网检索 → 生成人格文件 → 按区域修改 → 保存并查看完整文件。'),
        h('div', { 'data-pf-tabs': '' },
          h('button', { 'data-pf-tab': '', ...(view === 'create' || view === 'generating' ? { 'data-on': '' } : {}), onClick: () => { setView('create'); setError(''); setMessage('') } }, '新建'),
          h('button', { 'data-pf-tab': '', ...(view === 'library' || view === 'detail' ? { 'data-on': '' } : {}), onClick: loadLibrary }, '人格库'),
        ),
      )

      let body
      if (view === 'create') {
        body = h(CreateView, {
          form, setForm, busy, error,
          onGenerate: startGenerate, onDescribe: describe, onLibrary: loadLibrary,
          hasLast, onResume: resumeLast,
        })
      } else if (view === 'generating') {
        body = h(GeneratingView, { gen, onCancel: cancelGenerate, onBack: () => { setView('create'); setError(gen?.error || '') } })
      } else if (view === 'edit' && doc) {
        body = h(EditView, {
          doc, update, modules: doc.modules, busy, message, error, saved, md, simulation, simCount,
          dirty: savedDoc !== JSON.stringify(doc),
          onSave: save,
          onFile: openFile,
          onSimulate: simulate,
          onCountChange: setSimCount,
          onCloseSimulation: () => setSimulation(null),
          onBack: () => { setView('create'); setDoc(null); setSaved(null); setSimulation(null); setError(''); setMessage('') },
        })
      } else if (view === 'file') {
        body = h(FileView, { md, onBack: () => setView('edit') })
      } else if (view === 'library') {
        body = h(LibraryView, { personas, busy, onRefresh: loadLibrary, onCreate: () => setView('create'), onOpen: openDetail })
      } else if (view === 'detail') {
        body = h(DetailView, {
          detail, busy, message, onBack: loadLibrary, onEdit: editDetail,
        })
      } else {
        body = h(Note, null, '读取中…')
      }

      return h('div', { 'data-pf-page': '' }, h('style', null, CSS), header,
        error && view !== 'create' ? h(State, { kind: 'error' }, error) : null,
        body,
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist', id: 'persona-forge', order: 20, label: '人格工坊',
        }, Icon))
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main', key: 'persona-forge',
        }, Panel))
      },
    }
  },
})
