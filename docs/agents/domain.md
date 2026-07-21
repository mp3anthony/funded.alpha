# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

This repo predates the skill's default layout, so the paths below point at what the repo already maintains rather than the template defaults (`CONTEXT.md` + `docs/adr/`):

- Glossary lives at **`docs/GLOSSARY.md`** (the skill default would be `CONTEXT.md`).
- Decision records live under **`docs/decisions/`**, named `<issue-number>-<slug>.md` (the skill default would be `docs/adr/`).

## Before exploring, read these

- **`docs/GLOSSARY.md`** — the domain vocabulary for this repo.
- **`docs/decisions/`** — read the decision-log entries that touch the area you're about to work in.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── docs/
│   ├── GLOSSARY.md
│   └── decisions/
│       ├── 47-fast-nav-static-rsc.md
│       └── 49-cold-start-onboarding-flash.md
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `docs/GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision-log conflicts

If your output contradicts an existing decision-log entry under `docs/decisions/`, surface it explicitly rather than silently overriding:

> _Contradicts docs/decisions/47-fast-nav-static-rsc.md — but worth reopening because…_
