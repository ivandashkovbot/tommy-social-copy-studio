export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reason: 'method_not_allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ reason: 'missing_key' })
  }

  const { brief, controls, sampleCaptions } = req.body || {}
  if (!brief || !controls || !sampleCaptions) {
    return res.status(400).json({ reason: 'bad_request' })
  }

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

  const parseArray = (raw) => {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return null
      return parsed.filter((x) => typeof x === 'string')
    } catch {
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) return null
      try {
        const rescued = JSON.parse(match[0])
        return Array.isArray(rescued) ? rescued.filter((x) => typeof x === 'string') : null
      } catch {
        return null
      }
    }
  }

  const callModel = async (retry = false) => {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: retry
          ? `${prompt}\n\nImportant retry instruction: Return strictly valid JSON array of strings only. No preface. No markdown.`
          : prompt,
      }),
    })

    if (!response.ok) return { ok: false, reason: 'request_failed' }

    const data = await response.json()
    const text = data.output_text || data.output?.map((o) => o.content?.map((c) => c.text).join(' ')).join(' ')
    if (!text) return { ok: false, reason: 'empty_output' }

    const captions = parseArray(text)
    if (!captions || !captions.length) return { ok: false, reason: 'parse_failed' }
    return { ok: true, captions }
  }

  const first = await callModel(false)
  if (first.ok) return res.status(200).json({ captions: first.captions })

  const second = await callModel(true)
  if (second.ok) return res.status(200).json({ captions: second.captions })

  return res.status(502).json({ reason: second.reason || first.reason || 'request_failed' })
}
