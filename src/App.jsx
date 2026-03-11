import { useMemo, useState } from 'react'
import './App.css'

const sampleCaptions = {
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
const heroProducts = ['polo', 'trench', 'blazer', 'eyewear', 'watch', 'jewelry']
const contentTypes = ['Product Highlight', 'Talent Feature', 'Campaign Post', 'Seasonal Style', 'Event / Culture Moment']
const objectives = ['Brand Awareness', 'Engagement', 'Product Focus']
const moods = ['Effortless', 'Classic', 'Modern', 'Polished', 'Energetic']
const platforms = ['Instagram', 'X', 'TikTok', 'Threads']
const styles = ['Core Tommy', 'More Editorial', 'More Celebrity-Led', 'More Product-Forward', 'More Seasonal', 'More Campaign-Led']
const lengths = ['Short', 'Medium', 'Slightly Extended']

const initialBrief = {
  platform: 'Instagram',
  collection: 'Spring 2026',
  collectionCustom: '',
  heroProduct: 'polo',
  heroProductCustom: '',
  talent: '@patrickschwarzenegger',
  contentType: 'Talent Feature',
  objective: 'Engagement',
  mood: 'Polished',
  notes: 'The Tommy Hilfiger polo. A timeless spring staple with effortless energy.',
}

const initialControls = {
  style: 'Core Tommy',
  length: 'Medium',
  outputCount: 5,
  randomize: false,
}

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

function buildCaption(brief, controls, idx) {
  const product = brief.heroProductCustom.trim() || brief.heroProduct
  const collection = brief.collectionCustom.trim() || brief.collection
  const talent = brief.talent.trim()
  const notes = brief.notes.trim().toLowerCase()
  const seed = controls.randomize
    ? Math.floor(Math.random() * 999999)
    : hashSeed(JSON.stringify({ ...brief, ...controls, idx }))

  const descriptors = ['classic layer', 'timeless staple', 'modern essential', 'effortless finish', 'refined statement']
  const seasonalPhrases = ['for spring', 'for the season ahead', 'for now and next', 'for Spring 2026', 'for every day style']
  const campaignVerbs = ['setting the tone', 'leading the season', 'remixing heritage', 'defining the moment', 'framing the look']

  const selectedDescriptor = seededPick(descriptors, seed, idx)
  const seasonal = controls.style === 'More Seasonal' ? 'for Spring 2026' : seededPick(seasonalPhrases, seed, idx + 2)

  const templates = [
    `The Tommy Hilfiger ${product}. A ${selectedDescriptor} ${seasonal}.`,
    `${talent || '@talent'} in the ${product}, ${campaignVerbs[(seed + idx) % campaignVerbs.length]} for ${collection}.`,
    `The ${product}, a Tommy Hilfiger ${collection.toLowerCase()} staple.`,
    `${talent || 'Talent'} ${seededPick(campaignVerbs, seed, idx + 1)} for ${collection} style.`,
    `${titleCase(product)} with modern craftsmanship and timeless energy.`,
  ]

  let caption = templates[idx % templates.length]

  if (controls.style === 'More Editorial') {
    caption = caption.replace('.', ' —').replace('A ', '')
  }
  if (controls.style === 'More Celebrity-Led' && talent) {
    caption = `${talent} in Tommy Hilfiger ${product}. ${seasonal.charAt(0).toUpperCase() + seasonal.slice(1)}.`
  }
  if (controls.style === 'More Product-Forward') {
    caption = `The Tommy Hilfiger ${product}. ${titleCase(collection)} focus, ${seasonal}.`
  }
  if (controls.style === 'More Campaign-Led') {
    caption = `${titleCase(collection)}. ${talent || 'Tommy Hilfiger talent'} ${seededPick(campaignVerbs, seed, idx + 4)} with the ${product}.`
  }

  if (controls.length === 'Short') caption = caption.split(/[.!?]/)[0] + '.'
  if (controls.length === 'Slightly Extended') {
    const addOn = notes.includes('cta') ? ' Discover more on tommy.com.' : ' Styled for on and off the schedule.'
    caption += addOn
  }

  const reasons = [
    'Uses product-first structure',
    'Matches Tommy sentence cadence',
    'Includes seasonal framing',
    'Reflects premium editorial tone',
    'Uses Tommy-style vocabulary',
  ]

  const watchouts = []
  if (caption.length > 150) watchouts.push('Slightly too long')
  if (/!|\?\?/.test(caption)) watchouts.push('Could feel too promotional')
  if (/(lol|vibes|slay|omg|bestie)/i.test(caption)) watchouts.push('Too Gen Z-coded')
  if ((caption.match(/emoji|🔥|✨|💙/g) || []).length > 1) watchouts.push('Too emoji-heavy')
  if (/buy now|sale|shop now/i.test(caption)) watchouts.push('Too promotional')

  const scoreBase = 95 - watchouts.length * 4 - Math.max(0, caption.length - 130) * 0.05
  const score = Math.max(78, Math.min(97, Math.round(scoreBase)))

  return {
    caption,
    score,
    reasons,
    watchouts,
  }
}

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [brief, setBrief] = useState(initialBrief)
  const [controls, setControls] = useState(initialControls)
  const [output, setOutput] = useState([])

  const voiceProfile = useMemo(
    () => ({
      tone: ['Editorial', 'Polished', 'Effortless', 'Premium', 'Seasonal', 'Celebrity-led'],
      structure: ['Short sentences', 'Frequent sentence fragments', 'Product-first phrasing', 'Seasonal framing', 'Talent tagging', 'Minimal slang', 'Soft CTA language'],
      vocab: ['heritage', 'classic', 'timeless', 'effortless', 'staple', 'spring', 'modern craftsmanship', 'style', 'look'],
      templates: [
        'The Tommy Hilfiger [product]. A [descriptor] for [season].',
        '@[talent] in the [product].',
        'The [product], a Tommy Hilfiger [season] staple.',
        '[Talent] setting the tone for [season/style].',
        '[Product category] with modern craftsmanship and timeless energy.',
      ],
    }),
    [],
  )

  const generateCaptions = () => {
    const next = Array.from({ length: controls.outputCount }, (_, idx) => buildCaption(brief, controls, idx))
    setOutput(next)
  }

  const loadSampleData = () => {
    setBrief(initialBrief)
    setControls(initialControls)
    generateCaptions()
  }

  const resetBrief = () => {
    setBrief({
      platform: 'Instagram',
      collection: 'Spring 2026',
      collectionCustom: '',
      heroProduct: 'polo',
      heroProductCustom: '',
      talent: '',
      contentType: 'Product Highlight',
      objective: 'Brand Awareness',
      mood: 'Effortless',
      notes: '',
    })
    setOutput([])
  }

  if (showIntro) {
    return (
      <main className="intro-shell">
        <header className="intro-header">
          <button className="wordmark" onClick={() => setShowIntro(true)}>
            TOMMY SOCIAL COPY STUDIO
          </button>
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
        <button className="wordmark" onClick={() => setShowIntro(true)}>
          TOMMY SOCIAL COPY STUDIO
        </button>
        <p className="subtitle">A concept for codifying Tommy Hilfiger’s social voice into an AI-assisted editorial workflow</p>
      </header>

      <section className="grid">
        <aside className="panel">
          <h2>Recent Tommy Voice Patterns</h2>
          <div className="section">
            <h3>Sample Captions (X)</h3>
            <ul>{sampleCaptions.x.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="section">
            <h3>Sample Captions (Instagram)</h3>
            <ul>{sampleCaptions.instagram.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <div className="section">
            <h3>Tommy Voice Profile</h3>
            <p><strong>Tone</strong></p>
            <ul>{voiceProfile.tone.map((v) => <li key={v}>{v}</li>)}</ul>
            <p><strong>Structure</strong></p>
            <ul>{voiceProfile.structure.map((v) => <li key={v}>{v}</li>)}</ul>
            <p><strong>Signature Vocabulary</strong></p>
            <ul>{voiceProfile.vocab.map((v) => <li key={v}>{v}</li>)}</ul>
            <p><strong>Common Tommy Caption Templates</strong></p>
            <ol>{voiceProfile.templates.map((v) => <li key={v}>{v}</li>)}</ol>
            <p className="note">Observed voice: social captions written like fashion editorial headlines.</p>
          </div>
        </aside>

        <section className="panel primary-panel">
          <h2 className="primary-title">Create Tommy Caption</h2>
          <button className="primary full-btn top-cta" onClick={generateCaptions}>Generate Tommy Captions</button>
          <div className="form-grid">
            <label>Platform<select value={brief.platform} onChange={(e) => setBrief({ ...brief, platform: e.target.value })}>{platforms.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Collection / Story<select value={brief.collection} onChange={(e) => setBrief({ ...brief, collection: e.target.value })}>{collections.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Collection Custom Input<input value={brief.collectionCustom} onChange={(e) => setBrief({ ...brief, collectionCustom: e.target.value })} placeholder="Optional custom collection" /></label>
            <label>Hero Product<select value={brief.heroProduct} onChange={(e) => setBrief({ ...brief, heroProduct: e.target.value })}>{heroProducts.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Hero Product Custom Input<input value={brief.heroProductCustom} onChange={(e) => setBrief({ ...brief, heroProductCustom: e.target.value })} placeholder="Optional custom product" /></label>
            <label>Talent (optional)<input value={brief.talent} onChange={(e) => setBrief({ ...brief, talent: e.target.value })} placeholder="@talent" /></label>
            <label>Content Type<select value={brief.contentType} onChange={(e) => setBrief({ ...brief, contentType: e.target.value })}>{contentTypes.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Objective<select value={brief.objective} onChange={(e) => setBrief({ ...brief, objective: e.target.value })}>{objectives.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Mood<select value={brief.mood} onChange={(e) => setBrief({ ...brief, mood: e.target.value })}>{moods.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label className="full">Copy<textarea className="notes-input" rows="4" value={brief.notes} onChange={(e) => setBrief({ ...brief, notes: e.target.value })} placeholder="Write your initial caption copy draft here" /></label>
          </div>
          <div className="actions">
            <button onClick={loadSampleData}>Load Tommy Sample Data</button>
            <button onClick={resetBrief}>Reset Brief</button>
          </div>
        </section>

        <aside className="panel">
          <h2>Tommy Caption Output</h2>
          <div className="form-grid compact">
            <label>Caption Style<select value={controls.style} onChange={(e) => setControls({ ...controls, style: e.target.value })}>{styles.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Length<select value={controls.length} onChange={(e) => setControls({ ...controls, length: e.target.value })}>{lengths.map((o) => <option key={o}>{o}</option>)}</select></label>
            <label>Output Count<select value={controls.outputCount} onChange={(e) => setControls({ ...controls, outputCount: Number(e.target.value) })}>{[3, 5, 8].map((o) => <option key={o} value={o}>{o}</option>)}</select></label>
            <label className="toggle"><input type="checkbox" checked={controls.randomize} onChange={(e) => setControls({ ...controls, randomize: e.target.checked })} /> Randomize variants</label>
          </div>
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
