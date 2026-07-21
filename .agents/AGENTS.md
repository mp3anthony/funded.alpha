# Lead Developer Liaison Protocol

## 1. Roles

**Orchestrator (main session):** my sole point of contact and router. Every request I give it —
whether pointing at an existing GitHub issue or an off-the-cuff observation — is first assessed by
the orchestrator, which decides which subagent (if any) handles it next. Talks to me directly,
reviews all subagent output before passing it on, explains things in plain language, and is the
ONLY one that touches git/GitHub — pushing branches, opening PRs, updating or closing issues.
Subagents never message me directly; they report back to the orchestrator only.

**Subagents:** Each subagent below now names a **skill** as its technique — the internal method it
uses. Skills are techniques, not new roles: every subagent keeps exactly its existing permissions,
scope, and reporting line (subagents still report only to the orchestrator, never to me); only its
underlying method changes. Skill definitions live under `~/.claude/skills/`; the canonical label
vocabulary they apply is defined in docs/agents/triage-labels.md.

- **Interviewer** — when I bring an off-the-cuff observation (not yet a logged issue), Interviewer
  interrogates me for reproduction steps, expected vs actual behavior, when it started, and scope,
  until we reach a "Problem Agreement" — a fully scoped description of the problem. Read-only, no
  code/GitHub access. Reports the scoped problem back to the orchestrator. **Technique:** uses the
  `grill-me` skill to drive the interrogation — deliberately NOT `grill-with-docs`, whose variant
  maintains its own CONTEXT.md and would duplicate the glossary Docs already keeps at
  docs/GLOSSARY.md.
- **Issue logger** (renamed from Bug logger) — files GitHub issues via `gh` (bugs or features),
  including a testing checklist written as Markdown checkboxes in the issue body. **Technique:**
  uses the `to-tickets` skill to file, and the `triage` skill to apply the canonical labels defined
  in docs/agents/triage-labels.md. Applies `needs-triage` to every newly filed issue (see
  Human-in-the-Loop Labeling in Section 3).
- **Investigator** — investigates a logged issue: root-cause for bugs, codebase exploration for
  features. Read-only plus read-only bash. **Technique:** uses the `diagnosing-bugs` skill for
  root-cause work on bugs, and the `research` skill for codebase exploration on features. Also
  performs Duplicate/Overlap Detection: checks open issues for overlap before investigation
  concludes, and if found, flags it to me and proposes consolidating under a parent issue via
  `gh issue edit <number> --parent <parent-number>` — requires my agreement before proceeding.
  - **Red-green testing (opt-in only):** when I explicitly ask for it, Investigator first writes a
    test that reproduces the bug and confirms it fails (red), proving the root cause is correctly
    identified. Once Implementation applies a fix, the same test must pass (green). NOT spawned
    automatically — absent an explicit request, I test manually and report back myself.
- **Planner** — takes Investigator's report and writes the implementation plan, including
  alternatives considered and why they were rejected. Read-only, no code changes. **Technique:**
  uses the `to-spec` skill to turn the scoped problem into the implementation plan. As part of that
  plan it classifies whether Implementation can execute autonomously or whether some part requires
  me directly — the orchestrator turns that into a `ready-for-agent` / `ready-for-human` label (see
  Human-in-the-Loop Labeling in Section 3).
- **Implementation** — writes code. Only runs after I explicitly say "Proceed" to the plan (this
  is the "Plan Agreement" checkpoint, distinct from the earlier "Problem Agreement"). **Technique:**
  uses the `implement` skill.
- **Docs** — drafts a decision-log entry at docs/decisions/<issue-number>-<slug>.md, based on
  Planner's alternatives-considered reasoning plus anything Implementation ran into (a reverted
  approach, a deviation). Focuses on what was NOT implemented and why, and reasoning the code
  itself can't convey — never restates what the code already shows. Also updates
  docs/GLOSSARY.md if new domain terms were introduced. Read/write access scoped to docs/ only.
  **Technique:** uses the `domain-modeling` skill, already pointed at our existing docs/GLOSSARY.md
  and docs/decisions/ via docs/agents/domain.md.
- **Code Reviewer** — runs automatically after Implementation and Docs both finish, before the
  Post-Implementation Summary. Reviews the code diff against the agreed plan and the hard
  invariants below, AND reviews the Docs output to confirm it explains reasoning rather than
  restating the code. Approves back to the orchestrator, or flags issues to loop back before
  either is finalized. **Technique:** uses the `code-review` skill, applied against the agreed plan
  and our hard invariants — the same job it already had, run via the skill's method.

## 2. Interaction Philosophy (The "Problem Agreement" & "Plan Agreement" Phases)
* **Challenge Me:** If a feature or fix seems technically flawed, overly complex, or misaligned with my goals, you MUST challenge me and explain why. This challenge applies at both the Problem Agreement and Plan Agreement stages.
* **Problem Agreement:** Before any investigation or planning begins, we must reach a "Problem Agreement" — a fully scoped description of the problem. For off-the-cuff observations, this comes from Interviewer's questioning; for requests that already point at a logged GitHub issue, the issue itself stands in for Problem Agreement (confirmed, not re-interrogated).
* **Plan Agreement:** Before any code is written, we must reach a "Plan Agreement" — Planner's proposed implementation plan, including alternatives considered and rejected, presented to me for review. Saying "Proceed" is what closes this checkpoint.
* **Mentorship:** Explain technical concepts in simple terms. I am here to learn as we build.

## 3. Workflow Protocol
* **Routing:** The orchestrator assesses every request first. A request that references an
  already-logged GitHub issue goes straight to Investigator. An off-the-cuff observation goes to
  Interviewer first; once Problem Agreement is reached, the orchestrator suggests Issue logger to
  log it. See Investigator's Duplicate/Overlap Detection (Section 1).
* **Human-in-the-loop labeling:** the canonical labels from docs/agents/triage-labels.md are wired
  into the existing checkpoints. They are visible markers on GitHub, never a substitute for talking
  to me:
    1. **`needs-triage`** — Issue logger applies it to every newly filed issue. The orchestrator
       removes it once BOTH Investigator and Planner have completed their assessment (the issue then
       has a root cause / exploration and an agreed-shape plan).
    2. **`needs-info`** — if any subagent (Interviewer, Investigator, or Planner) needs my input and
       cannot proceed without it, the orchestrator applies `needs-info` to the issue AND notifies me
       directly in the conversation. The label alone is not sufficient notice; it is a marker on
       GitHub that accompanies a direct message to me.
    3. **`ready-for-agent` / `ready-for-human`** — when Planner produces a plan (Plan Agreement), it
       classifies whether Implementation can execute the plan autonomously (`ready-for-agent`) or
       whether some part requires me directly — third-party dashboard configuration, account setup,
       anything outside what Claude Code can touch (`ready-for-human`). The orchestrator applies the
       matching label and states the classification plainly when presenting the plan for my approval,
       not buried in the label alone.
* **Branching:** The orchestrator decides when a new branch is needed (informed by Investigator and
  Planner) and pushes it without asking my permission first.
* **Implementation Plans:** Once Problem Agreement is reached, the orchestrator delegates to
  Investigator (root-cause analysis for bugs, codebase exploration for features), then to Planner,
  who writes the implementation plan — including alternatives considered and rejected — for my
  review.
* **Execution:** After I say "Proceed" to the plan, reaching Plan Agreement, the orchestrator
  delegates to the Implementation subagent, followed by Docs and Code Reviewer.
* **Post-Implementation Summary:** Before requesting my approval on any diff, the orchestrator
  must produce a plain-language summary (not the raw diff) covering:
    1. **Files touched** — listed, with each one checked against the agreed plan; anything not in
       the plan gets flagged with a one-line reason.
    2. **What changed, in plain English** — described as a behavior change for a non-developer,
       no code snippets required.
    3. **Size sanity check** — rough line count of the diff, with a one-line comment on whether it
       matches the expected scope from the plan.
    4. **Scope boundary confirmation** — explicit statement of whether any reserved/fallback steps
       from the plan were used; if the plan held something back ("only if needed"), confirm it
       was NOT touched unless I was told and agreed.
    5. **Review sign-off** — confirmation that "Code reviewed ✓, Docs reviewed ✓", per Code
       Reviewer's pass.
    6. **Version impact** — a note that a version check will happen with me directly at merge time
       (see the Version check step under Completion & Deployment), rather than a pre-decided number.
       The Versioning table in README.md informs the suggested jump but is a loose guideline, not a
       fixed value.
  I approve based on this summary, not by reading the raw diff myself — though the raw diff stays
  available on request. This does not replace on-device testing: the phone test remains the actual
  pass/fail gate before an issue is closed, scoped per the Platform Testing Assessment (Section 4).
* **Completion & Deployment:**
    1. Pushing a branch automatically triggers a Vercel preview deployment.
    2. The orchestrator tags me on the relevant GitHub issue or PR with the preview URL and asks
       me to test.
    3. I test against the preview URL on my iPhone per the testing checklist, tick off the testing
       checklist on the issue, and close it.
    4. Closing the issue IS the go-ahead: the orchestrator merges the branch into `main` once the
       issue is closed, without asking separately, and does not merge before it's closed.
    5. **Version check:** immediately before merging to `main`, once I've confirmed the preview
       passed testing, the orchestrator asks me what version number I'd like to move to next —
       stating the current version and suggesting a possible new version based on what was
       implemented (referencing the Versioning table in README.md as a loose guideline, not a
       strict rule). I give the final version number, and the orchestrator applies exactly that to
       the app settings page before merging.
    6. **Catch-up sync:** the orchestrator does not poll GitHub in the background. When I return
       to a session and say something like "check closed issues and merge anything closed and not
       yet merged," the orchestrator checks open PRs/branches against their linked GitHub issues
       via `gh` and merges any branch whose linked issue is closed but not yet merged into `main`.

## 4. Documentation & QA
* **Issue reports:** The Issue logger subagent files a GitHub issue per bug or feature via `gh`,
  with a testing checklist written as checkboxes in the issue body — not a root-level file. I tick
  the checklist off and close the issue myself as confirmation that testing passed.
* **Implementation walkthroughs:** When a branch is pushed for review, the "why" and "how" go in
  the pull request description (`gh pr create`) — not a separate root-level file.
* **Decision log & glossary:** Docs' output — a decision-log entry at
  docs/decisions/<issue-number>-<slug>.md, plus any docs/GLOSSARY.md updates — is a documented
  deliverable. Code Reviewer checks it explains reasoning the code can't convey (rejected
  alternatives, deviations hit during Implementation) rather than restating the code, before it's
  finalized alongside the PR.
* **Platform Testing Assessment:** Before the testing checklist is added to an issue, the
  orchestrator — informed by Investigator/Planner — must assess whether the change is
  platform-sensitive (touches CSS, fixed positioning, viewport, touch targets, or native APIs like
  push/PWA install) or platform-agnostic (business logic, data handling, nothing touching layout or
  native browser behavior). The reasoning behind this assessment must be stated in the issue/PR, not
  left silent. This assessment no longer changes which devices get tested — every checklist is now
  iPhone-only (see Testing checklist scope). Its purpose now is to inform how carefully Code Reviewer
  scrutinizes cross-platform CSS/layout on a platform-sensitive change.
* **Testing checklist scope:** Every testing checklist added to the GitHub issue by Issue logger is
  iPhone-only, regardless of platform sensitivity. For a platform-sensitive change, the checklist
  still calls out the iOS/WebKit concerns explicitly:
    * **iOS/WebKit:** Check for layout/styling quirks and native browser interaction.
  Android is not tested pre-merge (see Device Awareness).
* **Current Test Devices:** Our current pre-merge physical test device is an **Apple iPhone 17**
  (iOS/WebKit) — the categories above are kept generic so this list can extend to other devices
  later without rewriting the protocol.
* **Device Awareness:** The app must still be built to work correctly on both iOS and Android at the
  code level — always consider both when writing and reviewing code. Pre-merge preview testing,
  however, is iPhone-only. Android usage happens post-merge, on `main`, via my wife and (eventually)
  other testers using the live app normally; any Android issues they hit come back through the normal
  Interviewer/off-the-cuff reporting flow like any other bug, not through the preview-testing checklist.

## 5. Technical Environment
* **Platform:** GitHub (source), Vercel (hosting).
* **Auto-Deploy:** Pushes to `main` trigger live Vercel deployments.
* **Credit/Token Control:** Do not run linter-checks or expensive operations until I give the explicit command to "Proceed."

## Next.js 14+ Mobile Layout & Viewport Invariants

When working on layouts, metadata, or fixed UI elements in this repository, you MUST adhere to the following rules:

1. **Next.js Viewport API:** NEVER use manual `<meta name="viewport">` or `<meta name="theme-color">` tags in the `<head>` or root `layout.tsx`. You MUST use the official `export const viewport: Viewport = { ... }` API. Next.js aggressively overwrites manual meta tags during client-side navigation, which will destroy `viewport-fit=cover` and break `env(safe-area-inset-bottom)` calculation.
2. **Fixed Elements and Overflow:** NEVER nest `position: fixed` elements (like nav bars, modals, or fab buttons) inside containers that have `overflow: hidden` or `overflow-x: hidden`. Due to an iOS WebKit bug, Safari treats these as `position: absolute` relative to the overflow container, causing layout shifts during flex reflows. Fixed elements MUST be rendered as high up in the DOM tree as possible, completely outside of any `overflow: hidden` wrappers.
