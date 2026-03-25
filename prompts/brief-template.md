# Design Brief Template

Use this structure to translate a freeform request into a precise build brief.
Fill every section — don't leave brackets. Infer reasonable defaults from context.

```
Build a [COMPONENT TYPE] for [PRODUCT/CONTEXT].

## Purpose
[What does this UI do? What problem does it solve? Who uses it?]

## Content
[List the actual data/content that needs to appear. Be specific — real field names,
real copy, realistic numbers. Don't say "some stats" — say "monthly revenue, active users, churn rate".]

## Interactions
[What can the user do? Click, hover, filter, expand, toggle? List each interaction.]

## Aesthetic Direction
[Pick one: brutalist / editorial / luxury-minimal / technical/dark / warm-organic / retro-futuristic /
high-density dashboard / airy marketing / glassy/blur / mono-color-with-accents]

[Optional: Reference a specific aesthetic: "Think Linear.app's sidebar" or "Like Stripe's dashboard
but warmer" or "Vercel's dark theme" — these are style references, not copy requests.]

## Constraints
- Viewport: [desktop / mobile / responsive]
- Color theme: [dark / light / system]
- [Any other hard constraints]
```

## Aesthetic Vocabulary Reference

| Term | Visual Reference |
|---|---|
| `editorial` | NYT, Stripe press pages — strong typography, generous whitespace, serif accents |
| `technical/dark` | Linear, Vercel, GitHub dark — high contrast, monospace, minimal decoration |
| `luxury-minimal` | Apple, Notion — extreme whitespace, single accent color, refined micro-typography |
| `high-density dashboard` | Bloomberg, Datadog — packed grid, small text, color = data encoding |
| `brutalist` | Figma's own marketing site (2022), Are.na — raw structure, no softening |
| `warm-organic` | Craft, Loom — rounded but not childish, warm tones, friendly micro-copy |
| `glassy/blur` | macOS Sonoma, iOS — backdrop-filter blur, translucency, depth layers |
| `retro-futuristic` | Raycast, Arc — nostalgic palette with modern motion |

## Prompt Patterns That Improve Output

**Anti-pattern aesthetic framing** — tell the model what to avoid:
> "Avoid: rounded-xl cards, gradient backgrounds, Inter font, purple-blue color schemes.
> Instead: dense grid, monospace where appropriate, sharp edges, strong typographic hierarchy."

**Constraint-first for complex components** — lead with hard constraints:
> CONSTRAINTS FIRST: virtualized list, no external state, controlled selection props
> NOW the feature: Build a data table for...

**Realistic placeholder data** — data shape affects layout decisions:
> Bad: `name: "John Doe"`, `amount: "$100"`
> Good: `borrowerName: "Heritage Capital Partners LLC"`, `loanAmount: "$2,450,000"`, `ltv: "72.3%"`
