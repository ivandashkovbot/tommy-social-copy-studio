# Tommy Social Copy Studio

**A concept for codifying Tommy Hilfiger’s social voice into an AI-assisted editorial workflow**

This prototype is a Tommy-specific internal concept demo for social teams.
It showcases how observed Tommy caption patterns can be translated into a structured, guided workflow for drafting new social copy.

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

Optional LLM mode (falls back automatically if missing):

```bash
# Vercel project environment variable (server-side)
OPENAI_API_KEY=your_api_key_here
```

## Demo walkthrough (2-3 minutes)

1. Open the intro state and frame the concept as an internal storytelling workflow.
2. Enter the studio and review **Recent Tommy Voice Patterns** (left column):
   - Tommy sample captions (X + Instagram)
   - Voice profile (tone, structure, vocabulary, templates)
3. In **New Tommy Post Brief** (center):
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
