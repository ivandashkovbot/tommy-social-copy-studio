function parseArray(raw) {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter((x) => typeof x === 'string')
  } catch {
    const match = raw?.match(/\[[\s\S]*\]/)
    if (!match) return null
    try {
      const rescued = JSON.parse(match[0])
      return Array.isArray(rescued) ? rescued.filter((x) => typeof x === 'string') : null
    } catch {
      return null
    }
  }
}

async function callOpenAI({ prompt, retry }) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return { ok: false, reason: 'missing_key', detail: 'OPENAI_API_KEY not set' }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      input: retry
        ? `${prompt}\n\nImportant retry instruction: Return strictly valid JSON array of strings only. No preface. No markdown.`
        : prompt,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    return { ok: false, reason: 'request_failed', detail: `openai_${response.status}${detail ? `:${detail.slice(0, 200)}` : ''}` }
  }

  const data = await response.json()
  const text = data.output_text || data.output?.map((o) => o.content?.map((c) => c.text).join(' ')).join(' ')
  if (!text) return { ok: false, reason: 'empty_output' }

  const captions = parseArray(text)
  if (!captions?.length) return { ok: false, reason: 'parse_failed' }
  return { ok: true, captions }
}

async function callOllama({ prompt, retry }) {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.1:8b'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: retry
        ? `${prompt}\n\nImportant retry instruction: Return strictly valid JSON array of strings only. No preface. No markdown.`
        : prompt,
      stream: false,
      options: { temperature: 0.4 },
    }),
  }).catch((err) => ({ ok: false, status: 0, __err: err?.message || 'network_error' }))

  if (!response.ok) {
    const detail = response.__err || (await response.text().catch(() => ''))
    return { ok: false, reason: 'request_failed', detail: `ollama_${response.status || 0}${detail ? `:${String(detail).slice(0, 200)}` : ''}` }
  }

  const data = await response.json()
  const text = data.response
  if (!text) return { ok: false, reason: 'empty_output' }

  const captions = parseArray(text)
  if (!captions?.length) return { ok: false, reason: 'parse_failed' }
  return { ok: true, captions }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ reason: 'method_not_allowed' })

  const { brief, controls, sampleCaptions } = req.body || {}
  if (!brief || !controls || !sampleCaptions) return res.status(400).json({ reason: 'bad_request' })

  const provider = (process.env.LLM_PROVIDER || 'openai').toLowerCase()

  const examples = [...(sampleCaptions.x || []).slice(0, 4), ...(sampleCaptions.instagram || []).slice(0, 4)]
    .slice(0, 8)
    .map((x) => `- ${x}`)
    .join('\n')

  const prompt = `You are writing Tommy Hilfiger social captions.

Tommy voice summary:
- Editorial, polished, effortless, premium, seasonal, celebrity-aware.
- Avoid slang, meme tone, emoji-heavy output.

Tommy caption rules:
- Prioritize event/cultural context, then tone, then location/context, then product.
- Do not default to product-first every time.
- Use short fashion-editorial cadence.
- If mood is funny or playful, allow light wordplay (especially racing/event references) while staying premium.

Observed vocabulary:
heritage, classic, timeless, effortless, staple, spring, modern craftsmanship, style, look

Recent Tommy examples:
${examples}

User brief:
Platform: ${brief.platform}
Collection/Story: ${brief.collectionCustom || brief.collection}
Hero Product: ${brief.heroProductCustom || brief.heroProduct}
Talent: ${brief.talent || 'none'}
Content Type: ${brief.contentType}
Objective: ${brief.objective}
Mood: ${brief.mood}
Copy notes: ${brief.notes || 'none'}
Style preference: ${controls.style}
Length: ${controls.length}

Generate exactly ${Math.min(Number(controls.outputCount) || 5, 5)} captions.
Return ONLY a JSON array of strings, no markdown.`

  const caller = provider === 'ollama' ? callOllama : callOpenAI

  const first = await caller({ prompt, retry: false })
  if (first.ok) return res.status(200).json({ captions: first.captions, provider })

  const second = await caller({ prompt, retry: true })
  if (second.ok) return res.status(200).json({ captions: second.captions, provider })

  return res.status(502).json({
    reason: second.reason || first.reason || 'request_failed',
    detail: second.detail || first.detail || null,
    provider,
  })
}
