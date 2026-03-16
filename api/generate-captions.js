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

const env = (key, fallback = '') => (process.env[key] ?? fallback).trim()

async function callOpenAI({ prompt, retry }) {
  const apiKey = env('OPENAI_API_KEY')
  if (!apiKey) return { ok: false, reason: 'missing_key', detail: 'OPENAI_API_KEY not set' }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: env('OPENAI_MODEL', 'gpt-4o-mini'),
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
  const baseUrl = env('OLLAMA_BASE_URL', 'http://127.0.0.1:11434')
  const model = env('OLLAMA_MODEL', 'llama3.1:8b')
  const proxyToken = env('OLLAMA_PROXY_TOKEN')

  const headers = { 'Content-Type': 'application/json' }
  if (proxyToken) headers.Authorization = `Bearer ${proxyToken}`

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers,
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

  const { brief, controls, sampleCaptions, selectedProfileName } = req.body || {}
  if (!brief || !controls || !sampleCaptions) return res.status(400).json({ reason: 'bad_request' })

  const provider = env('LLM_PROVIDER', 'openai').toLowerCase()

  if (provider === 'ollama' && env('OLLAMA_REQUIRE_PROXY_TOKEN', 'false').toLowerCase() === 'true' && !env('OLLAMA_PROXY_TOKEN')) {
    return res.status(500).json({ reason: 'missing_proxy_token', provider })
  }

  const examples = [...(sampleCaptions.x || []).slice(0, 4), ...(sampleCaptions.instagram || []).slice(0, 4)]
    .slice(0, 8)
    .map((x) => `- ${x}`)
    .join('\n')

  const isNewTommyVoice = String(selectedProfileName || '').toLowerCase().includes('new tommy voice')

  const profileDirective = isNewTommyVoice
    ? `Profile-specific direction (New Tommy Voice):
- Social-first, thumb-stopping, and interactive.
- Be edgier and more conversation-starting while still premium and brand-safe.
- Start with a hook built for feed interruption (challenge, POV, question, bold statement).
- Prefer punchy, short lines (roughly 4-10 words). 1-2 lines max.
- Use interactive formats more often: questions, dares, prompts, "you/your" framing.
- Prioritize nightlife, paddock energy, race-weekend momentum, afterparty cues.
- Allow playful Gen Z-friendly confidence, but avoid cringe slang, memes, or emojis.

Hard avoid patterns (do NOT mimic Recent Tommy editorial voice):
- Avoid product-first openings like "The [product]...".
- Avoid formal catalog/editorial cadence and polished campaign-headline tone.
- Avoid overusing words like "timeless", "heritage", "classic layer", "modern craftsmanship" unless explicitly requested.
- Avoid safe generic luxury phrasing with no social hook.

Desired examples of energy (not exact copy):
- "Race weekend. Outfit first, plans second."
- "Paddock energy. Who said yes to this fit?"
- "Miami after dark. Dress like you mean it."
- "You’re not underdressed, right?"`
    : `Profile-specific direction (Recent Tommy Voice Patterns):
- Keep editorial polish and premium cadence as primary style.
- Product/style language can be more refined and classic.`

  const prompt = `You are writing Tommy Hilfiger social captions.

Tommy voice summary:
- Editorial, polished, effortless, premium, seasonal, celebrity-aware.
- Avoid slang, meme tone, emoji-heavy output.

Tommy caption rules:
- Prioritize event/cultural context, then tone, then location/context, then product.
- Do not default to product-first every time.
- Use short fashion-editorial cadence.
- If mood is funny or playful, allow light wordplay (especially racing/event references) while staying premium.

${profileDirective}

Observed vocabulary:
heritage, classic, timeless, effortless, staple, spring, modern craftsmanship, style, look

Recent Tommy examples:
${examples}

User brief:
Selected profile: ${selectedProfileName || 'Recent Tommy Voice Patterns'}
Collection/Story: ${brief.collectionCustom || brief.collection}
Hero Product Input: ${brief.heroProductInput || 'none'}
Talent: ${brief.talent || 'none'}
Content Type: ${brief.contentType}
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
