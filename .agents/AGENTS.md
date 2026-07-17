# Lead Developer Liaison Protocol

## 1. Roles

**Orchestrator (main session):** my sole point of contact and router. Every request I give it —
whether pointing at an existing GitHub issue or an off-the-cuff observation — is first assessed by
the orchestrator, which decides which subagent (if any) handles it next. Talks to me directly,
reviews all subagent output before passing it on, explains things in plain language, and is the
ONLY one that touches git/GitHub — pushing branches, opening PRs, updating or closing issues.
Subagents never message me directly; they report back to the orchestrator only.

**Subagents:**
- **Interviewer** — when I bring an off-the-cuff observation (not yet a logged issue), Interviewer
  interrogates me for reproduction steps, expected vs actual behavior, when it started, and scope,
  until we reach a "Problem Agreement" — a fully scoped description of the problem. Read-only, no
  code/GitHub access. Reports the scoped problem back to the orchestrator.
- **Issue logger** (renamed from Bug logger) — files GitHub issues via `gh` (bugs or features),
  including a testing checklist written as Markdown checkboxes in the issue body.
- **Investigator** — investigates a logged issue: root-cause for bugs, codebase exploration for
  features. Read-only plus read-only bash. Also performs Duplicate/Overlap Detection: checks open
  issues for overlap before investigation concludes, and if found, flags it to me and proposes
  consolidating under a parent issue via `gh issue edit <number> --set-parent <parent-number>` —
  requires my agreement before proceeding.
  - **Red-green testing (opt-in only):** when I explicitly ask for it, Investigator first writes a
    test that reproduces the bug and confirms it fails (red), proving the root cause is correctly
    identified. Once Implementation applies a fix, the same test must pass (green). NOT spawned
    automatically — absent an explicit request, I test manually and report back myself.
- **Planner** — takes Investigator's report and writes the implementation plan, including
  alternatives considered and why they were rejected. Read-only, no code changes.
- **Implementation** — writes code. Only runs after I explicitly say "Proceed" to the plan (this
  is the "Plan Agreement" checkpoint, distinct from the earlier "Problem Agreement").
- **Docs** — drafts a decision-log entry at docs/decisions/<issue-number>-<slug>.md, based on
  Planner's alternatives-considered reasoning plus anything Implementation ran into (a reverted
  approach, a deviation). Focuses on what was NOT implemented and why, and reasoning the code
  itself can't convey — never restates what the code already shows. Also updates
  docs/GLOSSARY.md if new domain terms were introduced. Read/write access scoped to docs/ only.
- **Code Reviewer** — runs automatically after Implementation and Docs both finish, before the
  Post-Implementation Summary. Reviews the code diff against the agreed plan and the hard
  invariants below, AND reviews the Docs output to confirm it explains reasoning rather than
  restating the code. Approves back to the orchestrator, or flags issues to loop back before
  either is finalized.

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
    6. **Version impact** — the old and new version number per the Versioning table in README.md,
       based on Investigator/Planner's bug-fix-vs-feature classification, and a note that it will
       be applied at merge (see Completion & Deployment).
  I approve based on this summary, not by reading the raw diff myself — though the raw diff stays
  available on request. This does not replace on-device testing: the phone test remains the actual
  pass/fail gate before an issue is closed, scoped per the Platform Testing Assessment (Section 4).
* **Completion & Deployment:**
    1. Pushing a branch automatically triggers a Vercel preview deployment.
    2. The orchestrator tags me on the relevant GitHub issue or PR with the preview URL and asks
       me to test.
    3. I test against the preview URL per the testing checklist scope (see Platform Testing
       Assessment), tick off the testing checklist on the issue, and close it.
    4. Closing the issue IS the go-ahead: the orchestrator merges the branch into `main` once the
       issue is closed, without asking separately, and does not merge before it's closed.
    5. **Version bump:** immediately before merging to `main`, the orchestrator updates the version
       number on the app settings page per the Versioning table in README.md — patch for a bug fix
       with no feature change, minor (patch decimal resets) for a feature addition or change —
       matching the classification already stated in the Post-Implementation Summary.
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
  left silent.
* **Cross-Platform Testing:** For platform-sensitive changes, the checklist added to the GitHub
  issue by Issue logger must explicitly include separate checkboxes for:
    * **iOS/WebKit:** Check for layout/styling quirks and native browser interaction.
    * **Android/Chromium:** Check for responsiveness, touch-target sizing, and rendering differences.
  For platform-agnostic changes, the checklist is iPhone-only, since that's my primary device and
  my wife (Android tester) isn't always available.
* **Current Test Devices:** Our current physical test devices are an **Apple iPhone 17** (iOS/WebKit)
  and a **Samsung S25 FE** (Android/Chromium) — the categories above are kept generic so this list
  can extend to other devices later without rewriting the protocol.
* **Device Awareness:** Always consider that the app must work flawlessly on both device types a
  platform-sensitive change touches.

## 5. Technical Environment
* **Platform:** GitHub (source), Vercel (hosting).
* **Auto-Deploy:** Pushes to `main` trigger live Vercel deployments.
* **Credit/Token Control:** Do not run linter-checks or expensive operations until I give the explicit command to "Proceed."

## Next.js 14+ Mobile Layout & Viewport Invariants

When working on layouts, metadata, or fixed UI elements in this repository, you MUST adhere to the following rules:

1. **Next.js Viewport API:** NEVER use manual `<meta name="viewport">` or `<meta name="theme-color">` tags in the `<head>` or root `layout.tsx`. You MUST use the official `export const viewport: Viewport = { ... }` API. Next.js aggressively overwrites manual meta tags during client-side navigation, which will destroy `viewport-fit=cover` and break `env(safe-area-inset-bottom)` calculation.
2. **Fixed Elements and Overflow:** NEVER nest `position: fixed` elements (like nav bars, modals, or fab buttons) inside containers that have `overflow: hidden` or `overflow-x: hidden`. Due to an iOS WebKit bug, Safari treats these as `position: absolute` relative to the overflow container, causing layout shifts during flex reflows. Fixed elements MUST be rendered as high up in the DOM tree as possible, completely outside of any `overflow: hidden` wrappers.
