# Iteration Template

Use this structure after receiving a first version. Be surgical — only list what changes.

```
Iterate on the component with these specific changes:

VISUAL:
- [e.g., "Make the header font Syne instead of the current font"]
- [e.g., "The stage badges need more contrast — use filled solid colors not outlines"]

LAYOUT:
- [e.g., "Compress the card height — remove the bottom padding and tighten line-height on the meta row"]

BEHAVIOR:
- [e.g., "The hover quick-actions should slide up from the bottom of the card, not fade in"]

DATA:
- [e.g., "Add a 'flagged' boolean prop — when true, show a red left border stripe on the card"]

Do not change anything not listed above. Preserve all existing TypeScript types and props.
```

The explicit "do not change anything not listed" instruction is critical — it prevents the model from
"helpfully" refactoring things you didn't ask about.
