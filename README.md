# Tommy Social Copy Studio

**A concept for codifying Tommy Hilfiger’s social voice into an AI-assisted editorial workflow**

This prototype is a Tommy-specific internal concept demo for social teams.
It showcases how observed Tommy caption patterns can be translated into a structured, guided workflow for drafting new social copy.

It now also includes a separate **brand-agnostic demo** with reusable presets:
- Gen Z Copy
- Tech Founder Copy
- Prestige Brand Copy

## Run locally

```bash
cd tommy-social-copy-studio
npm install
npm run dev
```

Build check:

```bash
npm run build
```

Brand-agnostic demo URL (when dev server is running):

```text
http://localhost:5173/brand-agnostic-demo.html
```

Supporting assets:
- `/brand-presets.json`
- `/system-prompt-template.md`

Optional LLM mode (falls back automatically if missing):

```bash
# Server-side env vars (Vercel or local server runtime)
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here

# or Ollama
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
# optional token contract when Ollama is behind a proxy
OLLAMA_PROXY_TOKEN=change_me
OLLAMA_REQUIRE_PROXY_TOKEN=true

# optional site password gate (HTTP Basic Auth via middleware)
SITE_BASIC_AUTH_USER=demo
SITE_BASIC_AUTH_PASS=change_me
```

## Demo walkthrough (2-3 minutes)

1. Open the intro state and frame the concept as an internal storytelling workflow.
2. Enter the studio and review **Recent Tommy Voice Patterns** (left column):
   - Tommy sample captions (X + Instagram)
   - Voice profile (tone, structure, vocabulary, templates)
3. In **Create Tommy Caption** (center):
   - Load sample data
   - Adjust platform, collection/story, hero product, talent, mood, and notes
4. In **Tommy Caption Output** (right):
   - Select style, length, output count
   - Toggle **Randomize variants** on/off
   - Generate captions
5. Review each caption’s:
   - Tommy Alignment Score
   - Why it fits Tommy voice
   - Tommy Brand Drift Check (strong signals + watchouts)

## Concept summary

Tommy Social Copy Studio is intentionally **not a generic brand voice assistant**.
It is designed around Tommy’s current social behavior: editorial sentence rhythm, product-first phrasing, seasonal framing, talent-led moments, and recurring vocabulary.

## Design rationale

- **Editorial visual language** over SaaS dashboard patterns
- **Off-white canvas + deep navy + restrained red** for premium brand presentation
- **Three-column desktop layout** to mirror real editorial workflow:
  - Pattern analysis
  - Brief intake
  - Caption output evaluation
- **Subtle cards and spacing** to support leadership-facing concept demos

## Tommy-specific voice logic in this prototype

The generator uses seeded local rules (deterministic by default) and Tommy-aligned templates such as:

- The Tommy Hilfiger [product]. A [descriptor] for [season].
- @[talent] in the [product].
- The [product], a Tommy Hilfiger [season] staple.
- [Talent] setting the tone for [season/style].
- [Product category] with modern craftsmanship and timeless energy.

Output scoring and drift checks are tuned to Tommy-style constraints:

- prioritize editorial structure and product-centered language
- reinforce seasonal and premium vocabulary
- flag drift when captions become slangy, overly promotional, too casual, too long, emoji-heavy, or otherwise off-pattern
