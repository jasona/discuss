You are refining an existing React component. Apply only the changes the user specifies — nothing else.

## Input

The user's refinement request is: $ARGUMENTS

If `$ARGUMENTS` is empty, show the user the iteration template from `prompts/iteration-template.md` and ask them to fill it in. Do not proceed until they provide specifics.

## What to do

**Step 1 — Parse the changes.**

Read the current component that the user wants to iterate on. Look in `src/design-drafts/` for the most recently created or modified file. If it's unclear which component, ask. Check recent conversation context for the last component created or modified.

Identify which of these categories the user's request touches:
- VISUAL (typography, color, spacing, borders)
- LAYOUT (structure, density, positioning)
- BEHAVIOR (interactions, animation, state)
- DATA (new props, changed field names, added fields)

If the request is ambiguous (e.g., "make it look better"), ask one clarifying question before proceeding.

**Step 2 — Apply changes surgically.**

Modify only what was requested. Do not:
- Rename existing props or variables
- Refactor working logic
- Change the aesthetic direction unless explicitly asked
- Add new features beyond what was specified

**You must use the Edit tool to apply changes to the component file.** Do not rewrite the entire file unless the changes touch more than 60% of it.

**Step 3 — Summarize what changed.**

After writing the file, list the specific changes made as a short bullet list. Flag anything you couldn't implement exactly as requested and why.
