import { useState } from 'react'
import './App.css'

const initialSampleCaptions = {
  x: [
    'first race is in the books on track with @CodySimpson at the Australian Grand Prix',
    'the Tommy Hilfiger classics, remixed for spring with the one and only MGK @machinegunkelly',
    'an icon meets our icon Iman makes the Tommy Hilfiger heritage navy blazer look effortless and perfect for spring',
    'cruising into spring @SChecoPerez wears the Tommy Hilfiger heritage polo, finished with a timeless watch',
    'the Tommy Hilfiger heritage trench, a classic layer for spring',
    'you might recognize a few faces... a poolside party, hosted by #patrickschwarzenegger and #abbychampion, with special guests dropping in for Spring 2026. #checoperez #lionelrichie #lucienlaviscount #mgk #soojoopark #iman',
    "Tommy Hilfiger Spring 2026. @PSchwarzenegger's ready, are you?",
    "Marco Asensio's pick for those sunny days ahead discover our latest eyewear collection on tommy.com",
    'watches and jewelry with modern craftsmanship and timeless energy on tommy.com',
    'Inspired by the Cadillac Formula 1 Team’s official gear. Designed for on and off the track.',
  ],
  instagram: [
    'The first sign of spring? @its_lucien in the perfect Tommy Hilfiger polo.',
    'The Tommy Hilfiger heritage trench. A classic layer for spring @abbychampion',
    'The navy blazer, a Tommy Hilfiger spring staple worn by @patrickschwarzenegger',
    '@patrickschwarzenegger & @abbychampion setting the tone for Spring 2026 style, layering modern prep essentials for an effortless look',
    '@leniklum elevates the look with effortless watch and jewelry layering',
    ' @its_lucien’s spring look. Watches and jewelry with modern craftsmanship and timeless energy.',
    'Festive looks with timeless style for everyone',
  ],
}

const collections = ['Spring 2026', 'Heritage Classics', 'Modern Prep', 'Eyewear', 'Watches & Jewelry', 'Motorsport']
const contentTypes = ['Product Highlight', 'Talent Feature', 'Campaign Post', 'Seasonal Style', 'Event / Culture Moment']
const moods = ['Effortless', 'Classic', 'Modern', 'Polished', 'Energetic', 'Funny', 'Playful']
const styles = ['Core Tommy', 'More Editorial', 'More Celebrity-Led', 'More Product-Forward', 'More Seasonal', 'More Campaign-Led']
const lengths = ['Short', 'Medium', 'Slightly Extended']

const initialBrief = {
  collection: 'Spring 2026',
  collectionCustom: '',
  heroProductInput: 'polo',
  talent: '@patrickschwarzenegger',
  contentType: 'Talent Feature',
  mood: 'Polished',
  notes: 'The Tommy Hilfiger polo. A timeless spring staple with effortless energy.',
}

const initialControls = {
  style: 'Core Tommy',
  length: 'Medium',
  outputCount: 5,
}

const createDefaultProfile = () => ({
  id: 'recent-tommy',
  name: 'Recent Tommy Voice Patterns',
  sampleCaptions: initialSampleCaptions,
  toneItems: ['Editorial', 'Polished', 'Effortless', 'Premium', 'Seasonal', 'Celebrity-led'],
  structureItems: [
    'Short sentences',
    'Frequent sentence fragments',
    'Product-first phrasing',
    'Seasonal framing',
    'Talent tagging',
    'Minimal slang',
    'Soft CTA language',
  ],
  vocabItems: ['heritage', 'classic', 'timeless', 'effortless', 'staple', 'spring', 'modern craftsmanship', 'style', 'look'],
  templateItems: [
    'The Tommy Hilfiger [product]. A [descriptor] for [season].',
    '@[talent] in the [product].',
    'The [product], a Tommy Hilfiger [season] staple.',
    '[Talent] setting the tone for [season/style].',
    '[Product category] with modern craftsmanship and timeless energy.',
  ],
  locked: true,
})

const createMiamiNightsProfile = () => ({
  id: 'miami-nights',
  name: 'New Tommy Voice',
  sampleCaptions: {
    x: [
      'Some nights require better outfits.',
      'Outfits that make plans happen.',
      'Dress like you have plans.',
      'The night starts with the outfit.',
      'From the paddock to the afterparty.',
      'Miami nights hit different in Tommy.',
      'When the lights go out, the fits show up.',
      'Race day. Dress accordingly.',
      'The paddock has a dress code.',
      'Paddock approved.',
      'The plan? Look good first. Go from there.',
      'When the fit does the talking.',
    ],
    instagram: [
      'Some nights require better outfits.',
      'Outfits that make plans happen.',
      'Dress like you have plans.',
      'The night starts with the outfit.',
      'Miami nights hit different in Tommy.',
      'The fastest weekend of the year deserves better outfits.',
      'The heritage polo, now in Miami mode.',
      'Miami nights, Tommy classics.',
      'Miami race weekend. Dress like you might end up on a yacht.',
      'The paddock has a dress code.',
      'Paddock approved.',
      'Main character wardrobe.',
      'The plan? Look good first. Go from there.',
      'When the fit does the talking.',
    ],
  },
  toneItems: ['Social first', 'confident', 'playful', 'stylish', 'effortless', 'socially aware', 'Playful but controlled', 'Never try-hard', 'Sharp', 'Witty', 'Gen z'],
  structureItems: ['Moment → Style', 'Location → Outfit', 'Event → Fashion payoff', 'Location → Outfit'],
  vocabItems: ['heritage', 'classic', 'timeless', 'effortless', 'pace', 'fast', 'weekend', 'party', 'night', 'coast', 'club', 'scene'],
  templateItems: ['[Short style statement].', '[Location]. [Tommy product or style].', '[Event or moment]. [Fashion payoff].', 'The [product]. [Cultural or seasonal payoff].'],
  locked: false,
})

function hashSeed(text) {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededPick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length]
}

function titleCase(input) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function evaluateCaption(caption, brief) {
  const notes = brief.notes.toLowerCase()
  const text = caption.toLowerCase()
  const reasons = []

  if (/(race|grand prix|weekend|trackside|paddock|event|launch|miami)/i.test(text)) reasons.push('Leads with event/cultural context before product')
  if (brief.mood && text.includes(brief.mood.toLowerCase().split(' ')[0])) reasons.push('Reflects selected tone and editorial cadence')
  if (/(miami|paris|new york|london|milan|monaco|tokyo|trackside)/i.test(text)) reasons.push('Uses location or occasion framing from the brief')
  if (notes && text.includes(notes.slice(0, Math.min(18, notes.length)))) reasons.push('Integrates notes/copy guidance directly')
  if (/(heritage|classic|timeless|effortless|staple|modern craftsmanship|style|look)/i.test(text)) reasons.push('Keeps Tommy-style premium vocabulary')

  const watchouts = []
  if (caption.length > 160) watchouts.push('Slightly too long')
  if (/!{2,}|\?\?/.test(caption)) watchouts.push('Could feel too promotional')
  if (/(lol|vibes|slay|omg|bestie|meme)/i.test(caption)) watchouts.push('Too Gen Z-coded')
  if ((caption.match(/[🔥✨💙😂🤣]/g) || []).length > 0) watchouts.push('Too emoji-heavy')
  if (/buy now|sale|shop now/i.test(caption)) watchouts.push('Too promotional')
  if (!/(race|grand prix|weekend|trackside|paddock|event|launch|miami)/i.test(text) && /event|f1|race|miami|weekend/i.test(notes)) {
    watchouts.push('Could be off-brief on event context')
  }

  const reasonCountBonus = Math.min(5, reasons.length) * 1.5
  const scoreBase = 90 + reasonCountBonus - watchouts.length * 4 - Math.max(0, caption.length - 135) * 0.05
  const score = Math.max(72, Math.min(97, Math.round(scoreBase)))

  return {
    caption,
    score,
    reasons: reasons.length
      ? reasons
      : [
        'Matches Tommy sentence cadence',
        'Reflects premium editorial tone',
      ],
    watchouts,
  }
}

function buildCaption(brief, controls, idx) {
  const product = brief.heroProductCustom.trim() || brief.heroProduct
  const collection = brief.collectionCustom.trim() || brief.collection
  const talent = brief.talent.trim()
  const notesRaw = brief.notes.trim()
  const notes = notesRaw.toLowerCase()
  const seed = controls.randomize
    ? Math.floor(Math.random() * 999999)
    : hashSeed(JSON.stringify({ ...brief, ...controls, idx }))

  const eventHints = ['race weekend', 'grand prix', 'f1', 'event', 'launch', 'party', 'trackside', 'paddock', 'afterparty']
  const locationHints = ['miami', 'paris', 'new york', 'london', 'milan', 'monaco', 'tokyo']
  const moodText = `${brief.mood} ${notes}`.toLowerCase()
  const hasEvent = eventHints.some((hint) => notes.includes(hint)) || brief.contentType === 'Event / Culture Moment'
  const location = locationHints.find((city) => notes.includes(city))
  const eventPhrase =
    (notes.includes('miami') && notes.includes('race weekend') && 'Miami race weekend')
    || (notes.includes('grand prix') && `${location ? titleCase(location) : 'Grand Prix'} spotlight`)
    || (notes.includes('f1') && `${location ? titleCase(location) : 'F1'} pace`)
    || (brief.contentType === 'Event / Culture Moment' && `${collection} moment`)
    || `${collection} perspective`

  const editorialClosers = ['effortless style.', 'timeless energy.', 'classic Tommy pace.', 'heritage, remixed for now.']
  const funnyRaceLines = [
    `${eventPhrase}. Fast laps, effortless style.`,
    `Trackside in ${location ? titleCase(location) : 'the city'}. Tommy classics keeping pace.`,
    `Pole position energy for ${eventPhrase.toLowerCase()}.`,
    'From the paddock to the afterparty.',
  ]

  const eventFirstTemplates = [
    `${eventPhrase}. ${seededPick(editorialClosers, seed, idx)}`,
    `${location ? `Trackside in ${titleCase(location)}.` : 'Trackside perspective.'} ${talent || 'Tommy talent'} in the ${product}.`,
    `${eventPhrase}. ${titleCase(product)} styled for on and off the track.`,
    `${hasEvent ? 'From the paddock to the afterparty.' : `${collection}.`} ${titleCase(product)} with modern craftsmanship and timeless energy.`,
  ]

  const productTemplates = [
    `The Tommy Hilfiger ${product}. A modern essential for ${collection.toLowerCase()}.`,
    `${talent || '@talent'} in the ${product}, setting the tone for ${collection}.`,
    `The ${product}, a Tommy Hilfiger ${collection.toLowerCase()} staple.`,
  ]

  let caption = (hasEvent ? eventFirstTemplates : productTemplates)[idx % (hasEvent ? eventFirstTemplates.length : productTemplates.length)]

  if (/(funny|playful)/i.test(moodText) && hasEvent) {
    caption = funnyRaceLines[idx % funnyRaceLines.length]
  }

  if (notesRaw) {
    const conciseNote = notesRaw.length > 70 ? `${notesRaw.slice(0, 70).trim()}…` : notesRaw
    if (!caption.toLowerCase().includes(conciseNote.toLowerCase().slice(0, 18))) {
      caption = `${caption} ${conciseNote}`
    }
  }

  if (controls.style === 'More Product-Forward') caption = `${titleCase(product)} focus. ${caption}`
  if (controls.style === 'More Celebrity-Led' && talent) caption = `${talent}. ${caption}`
  if (controls.style === 'More Campaign-Led') caption = `${titleCase(collection)} campaign. ${caption}`
  if (controls.length === 'Short') caption = caption.split(/[.!?]/).filter(Boolean).slice(0, 2).join('. ') + '.'
  if (controls.length === 'Slightly Extended') caption += ' Styled for the moment and beyond.'

  return evaluateCaption(caption, brief)
}

async function generateWithLLM(brief, controls, sampleCaptions, selectedProfileName) {
  const response = await fetch('/api/generate-captions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brief, controls, sampleCaptions, selectedProfileName }),
  })

  if (!response.ok) {
    let reason = 'request_failed'
    let detail = null
    try {
      const data = await response.json()
      if (data?.reason) reason = data.reason
      if (data?.detail) detail = data.detail
    } catch {
      // ignore parse errors
    }
    return { ok: false, reason, detail, data: null }
  }

  const data = await response.json()
  if (!Array.isArray(data?.captions) || !data.captions.length) {
    return { ok: false, reason: 'parse_failed', data: null }
  }

  return {
    ok: true,
    reason: null,
    provider: data.provider || 'llm',
    data: data.captions.map((x) => evaluateCaption(String(x).trim(), brief)),
  }
}

function BrandMark({ asButton = false, onClick }) {
  const Inner = (
    <>
      <img
        className="brand-logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Tommy_Hilfiger_logo.svg/512px-Tommy_Hilfiger_logo.svg.png"
        alt="Tommy Hilfiger"
      />
      <span className="wordmark-text">SOCIAL COPY STUDIO</span>
    </>
  )

  if (asButton) {
    return (
      <button className="wordmark" onClick={onClick}>
        {Inner}
      </button>
    )
  }

  return <div className="wordmark static">{Inner}</div>
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [brief, setBrief] = useState(initialBrief)
  const [controls, setControls] = useState(initialControls)
  const [output, setOutput] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [genNotice, setGenNotice] = useState('')
  const [llmStatus, setLlmStatus] = useState('idle')
  const [llmProviderLabel, setLlmProviderLabel] = useState('LLM')
  const [voiceProfiles, setVoiceProfiles] = useState([createDefaultProfile(), createMiamiNightsProfile()])
  const [selectedProfileId, setSelectedProfileId] = useState('recent-tommy')

  const selectedProfile = voiceProfiles.find((profile) => profile.id === selectedProfileId) || voiceProfiles[0]
  const sampleCaptions = selectedProfile.sampleCaptions
  const toneItems = selectedProfile.toneItems
  const structureItems = selectedProfile.structureItems
  const vocabItems = selectedProfile.vocabItems
  const templateItems = selectedProfile.templateItems

  const updateSelectedProfile = (updater) => {
    setVoiceProfiles((prev) => prev.map((profile) => (profile.id === selectedProfile.id ? updater(profile) : profile)))
  }

  const generateCaptions = async () => {
    setIsGenerating(true)
    setGenNotice('')
    setLlmStatus('checking')

    const llmResult = await generateWithLLM(brief, controls, sampleCaptions, selectedProfile?.name)
    if (llmResult?.ok && llmResult.data?.length) {
      setOutput(llmResult.data)
      setLlmProviderLabel((llmResult.provider || 'LLM').toUpperCase())
      setLlmStatus('connected')
      setIsGenerating(false)
      return
    }

    if (llmResult?.reason === 'missing_key') {
      setLlmStatus('missing_key')
      setGenNotice('LLM needs server env credentials/config before generating.')
    } else {
      setLlmStatus('error')
      const detail = llmResult?.detail ? ` (${llmResult.detail})` : ''
      setGenNotice(`LLM request failed.${detail}`)
    }

    setIsGenerating(false)
  }

  const addListItem = (field, label) => {
    const value = window.prompt(`Add item to ${label}`)
    if (!value || !value.trim()) return
    updateSelectedProfile((profile) => ({ ...profile, [field]: [...profile[field], value.trim()] }))
  }

  const deleteListItem = (field, indexToDelete) => {
    updateSelectedProfile((profile) => ({ ...profile, [field]: profile[field].filter((_, index) => index !== indexToDelete) }))
  }

  const addVoiceProfile = () => {
    const name = window.prompt('Name for new voice profile')
    if (!name || !name.trim()) return
    const id = `profile-${Date.now()}`
    const profile = {
      id,
      name: name.trim(),
      sampleCaptions: { x: [], instagram: [] },
      toneItems: [],
      structureItems: [],
      vocabItems: [],
      templateItems: [],
      locked: false,
    }
    setVoiceProfiles((prev) => [...prev, profile])
    setSelectedProfileId(id)
  }

  const deleteVoiceProfile = () => {
    if (selectedProfile.locked) return
    if (!window.confirm(`Delete profile "${selectedProfile.name}"?`)) return
    setVoiceProfiles((prev) => prev.filter((profile) => profile.id !== selectedProfile.id))
    setSelectedProfileId('recent-tommy')
  }

  const loadSampleData = () => {
    setBrief(initialBrief)
    setControls(initialControls)
    updateSelectedProfile((profile) => ({
      ...profile,
      ...createDefaultProfile(),
      id: profile.id,
      name: profile.name,
      locked: profile.locked,
    }))
    setOutput([])
    setGenNotice('')
  }

  const resetBrief = () => {
    setBrief({
      collection: 'Spring 2026',
      collectionCustom: '',
      heroProductInput: '',
      talent: '',
      contentType: 'Product Highlight',
      mood: 'Effortless',
      notes: '',
    })
    setOutput([])
  }

  if (showIntro) {
    return (
      <main className="intro-shell">
        <header className="intro-header">
          <BrandMark asButton onClick={() => setShowIntro(true)} />
          <p className="subtitle">A concept for codifying Tommy Hilfiger’s social voice into an AI-assisted editorial workflow</p>
        </header>
        <section className="intro-card">
          <p className="eyebrow">Internal Concept Demo</p>
          <h1>An internal concept for AI-assisted social storytelling at Tommy Hilfiger.</h1>
          <p>
            This prototype demonstrates how Tommy’s current social voice can be translated into a guided workflow for generating premium,
            editorial-style captions.
          </p>
          <button className="primary" onClick={() => { setShowIntro(false); loadSampleData() }}>
            Enter Studio
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <BrandMark asButton onClick={() => setShowIntro(true)} />
        <p className="subtitle">A concept for codifying Tommy Hilfiger’s social voice into an AI-assisted editorial workflow</p>
      </header>

      <section className="grid">
        <aside className="panel">
          <h2>Voice Pattern Library</h2>
          <div className="actions">
            <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)}>
              {voiceProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
            </select>
            <button onClick={addVoiceProfile}>Add Pattern</button>
            {!selectedProfile.locked && <button onClick={deleteVoiceProfile}>Delete Pattern</button>}
          </div>
          <div className="section">
            <div className="section-head"><h3>Sample Captions (X)</h3><button onClick={() => {
              const value = window.prompt('Add item to Sample Captions (X)')
              if (!value || !value.trim()) return
              updateSelectedProfile((profile) => ({ ...profile, sampleCaptions: { ...profile.sampleCaptions, x: [...profile.sampleCaptions.x, value.trim()] } }))
            }}>Add</button></div>
            <ul>
              {sampleCaptions.x.map((item, index) => (
                <li key={`${item}-${index}`} className="editable-item">
                  <span>{item}</span>
                  <button className="icon-btn" onClick={() => updateSelectedProfile((profile) => ({ ...profile, sampleCaptions: { ...profile.sampleCaptions, x: profile.sampleCaptions.x.filter((_, i) => i !== index) } }))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <div className="section-head"><h3>Sample Captions (Instagram)</h3><button onClick={() => {
              const value = window.prompt('Add item to Sample Captions (Instagram)')
              if (!value || !value.trim()) return
              updateSelectedProfile((profile) => ({ ...profile, sampleCaptions: { ...profile.sampleCaptions, instagram: [...profile.sampleCaptions.instagram, value.trim()] } }))
            }}>Add</button></div>
            <ul>
              {sampleCaptions.instagram.map((item, index) => (
                <li key={`${item}-${index}`} className="editable-item">
                  <span>{item}</span>
                  <button className="icon-btn" onClick={() => updateSelectedProfile((profile) => ({ ...profile, sampleCaptions: { ...profile.sampleCaptions, instagram: profile.sampleCaptions.instagram.filter((_, i) => i !== index) } }))}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="section">
            <h3>{selectedProfile.name}</h3>
            <p className="section-head"><strong>Tone</strong><button onClick={() => addListItem('toneItems', 'Tone')}>Add</button></p>
            <ul>{toneItems.map((v, index) => <li key={`${v}-${index}`} className="editable-item"><span>{v}</span><button className="icon-btn" onClick={() => deleteListItem('toneItems', index)}>Delete</button></li>)}</ul>
            <p className="section-head"><strong>Structure</strong><button onClick={() => addListItem('structureItems', 'Structure')}>Add</button></p>
            <ul>{structureItems.map((v, index) => <li key={`${v}-${index}`} className="editable-item"><span>{v}</span><button className="icon-btn" onClick={() => deleteListItem('structureItems', index)}>Delete</button></li>)}</ul>
            <p className="section-head"><strong>Signature Vocabulary</strong><button onClick={() => addListItem('vocabItems', 'Signature Vocabulary')}>Add</button></p>
            <ul>{vocabItems.map((v, index) => <li key={`${v}-${index}`} className="editable-item"><span>{v}</span><button className="icon-btn" onClick={() => deleteListItem('vocabItems', index)}>Delete</button></li>)}</ul>
            <p className="section-head"><strong>Common Tommy Caption Templates</strong><button onClick={() => addListItem('templateItems', 'Common Tommy Caption Templates')}>Add</button></p>
            <ol>{templateItems.map((v, index) => <li key={`${v}-${index}`} className="editable-item"><span>{v}</span><button className="icon-btn" onClick={() => deleteListItem('templateItems', index)}>Delete</button></li>)}</ol>
            <p className="note">Observed voice: social captions written like fashion editorial headlines.</p>
          </div>
        </aside>

        <section className="panel primary-panel">
          <h2 className="primary-title">Create Tommy Caption</h2>
          <label className="full">Copy<textarea className="notes-input" rows="4" value={brief.notes} onChange={(e) => setBrief({ ...brief, notes: e.target.value })} placeholder="Write your initial caption copy draft here" /></label>
          <button className="primary full-btn top-cta" onClick={generateCaptions} disabled={isGenerating}>{isGenerating ? 'Generating…' : 'Generate Tommy Captions'}</button>
          <div className="form-grid">
            <label>Collection / Story<select value={brief.collection} onChange={(e) => setBrief({ ...brief, collection: e.target.value })}>{collections.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Collection Input<input value={brief.collectionCustom} onChange={(e) => setBrief({ ...brief, collectionCustom: e.target.value })} placeholder="Optional custom collection" /></label>
            <label>Hero Product Input<input value={brief.heroProductInput} onChange={(e) => setBrief({ ...brief, heroProductInput: e.target.value })} placeholder="e.g. white polo" /></label>
            <label>Talent (optional)<input value={brief.talent} onChange={(e) => setBrief({ ...brief, talent: e.target.value })} placeholder="@talent" /></label>
            <label>Content Type<select value={brief.contentType} onChange={(e) => setBrief({ ...brief, contentType: e.target.value })}>{contentTypes.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Mood<select value={brief.mood} onChange={(e) => setBrief({ ...brief, mood: e.target.value })}>{moods.map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <div className="actions">
            <button onClick={loadSampleData}>Load Tommy Sample Data</button>
            <button onClick={resetBrief}>Reset Brief</button>
          </div>
        </section>

        <aside className="panel">
          <h2>Tommy Caption Output</h2>
          <div className="form-grid compact">
            <div className={`llm-badge ${llmStatus}`}>
              {llmStatus === 'connected' ? `LLM connected · ${llmProviderLabel}` : llmStatus === 'checking' ? 'Checking LLM…' : llmStatus === 'missing_key' ? 'LLM missing API key' : llmStatus === 'error' ? 'LLM request failed' : 'LLM ready'}
            </div>
            {llmStatus === 'missing_key' && (
              <p className="inline-hint">Set server env vars: <code>LLM_PROVIDER</code>=openai with <code>OPENAI_API_KEY</code>, or <code>LLM_PROVIDER</code>=ollama with <code>OLLAMA_BASE_URL</code>.</p>
            )}
            <label>Caption Style<select value={controls.style} onChange={(e) => setControls({ ...controls, style: e.target.value })}>{styles.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Length<select value={controls.length} onChange={(e) => setControls({ ...controls, length: e.target.value })}>{lengths.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Output Count<select value={controls.outputCount} onChange={(e) => setControls({ ...controls, outputCount: Number(e.target.value) })}>{[3, 5].map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
          </div>
          {genNotice && <p className="notice">{genNotice}</p>}
          <div className="output-list">
            {output.length === 0 && <p className="muted">No captions yet. Generate to preview Tommy-aligned outputs.</p>}
            {output.map((item, idx) => (
              <article className="caption-card" key={`${item.caption}-${idx}`}>
                <p className="caption">{item.caption}</p>
                <p className="score">Tommy Alignment Score: <strong>{item.score}</strong></p>
                <div>
                  <p><strong>Why it fits Tommy voice</strong></p>
                  <ul>{item.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
                <div className="drift">
                  <p><strong>Tommy Brand Drift Check</strong></p>
                  <p><strong>Strong:</strong></p>
                  <ul>
                    <li>✔ Editorial sentence structure</li>
                    <li>✔ Product-centered</li>
                    <li>✔ Seasonal language</li>
                  </ul>
                  <p><strong>Watchouts:</strong></p>
                  {item.watchouts.length ? <ul>{item.watchouts.map((w) => <li key={w}>⚠ {w}</li>)}</ul> : <p>None detected.</p>}
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
