# funded.

**Fund the house first. Everything else comes second.**

Funded is a single-file household cash-flow web app. It isn't a budgeting tool that tracks every coffee — it's built around one idea: contributors enter their income and the app tells each person exactly what to transfer on payday to cover household bills before personal spending begins.

---

## What it does

- Calculates each contributor's weekly transfer to cover household bills in full
- Tracks bill payment status (paid, funded, auto, overdue) across any billing frequency
- Converts all bills to a weekly equivalent so everything compares apples-to-apples
- Manages sinking funds (holidays, emergencies, etc.) that grow from surplus income
- Applies surplus rules — when income exceeds a threshold, a defined percentage routes to a sinking fund automatically
- Works entirely offline, with no server, no account, and no data leaving the device

---

## App structure

Five main screens, plus an embedded testing guide:

| Screen | Purpose |
|--------|---------|
| **Dashboard** | Household health score, weekly surplus/shortfall, contributor overview, bill status grouped by frequency |
| **Payday** | Enter income for each contributor — app outputs exact transfer amounts; supports recurring (fixed salary) mode |
| **Bills** | All household costs organised by category; any billing frequency supported |
| **Funds** | Sinking funds with targets, progress bars, and weekly auto-contribution tracking |
| **Settings** | Household name, payment mode, contributors, surplus rules, data export/import |
| **Testing Guide** | Embedded alpha guide; accessible from Settings → Testing guide |

---

## Technical details

- **Single HTML file** — no build step, no framework, no CDN dependencies beyond Google Fonts
- **localStorage persistence** — all data stored on-device; nothing sent to a server
- **iOS Safari + Android Chrome** — primary target platforms; installed as a home screen PWA
- **Light and dark mode** — via `prefers-color-scheme`; both fully legible
- **Safe area insets** — applied to all fixed bottom UI for notched devices

### Key design decisions

**Screen switching** uses `position:absolute` with `opacity` and `pointer-events` toggling — never `display` on `.screen` elements via ID selectors. This avoids specificity conflicts that caused the original screen-switching bug.

**`confirm()` and `alert()` inside `FileReader.onload`** are silently suppressed by iOS Safari. All state mutations and dialog calls after a file read are escaped via `setTimeout(fn, 0)`.

**Category on save** is always read directly from the `<select>` element — `autoCat()` is a display-time fallback only and never writes to state.

**`fundedBy` splits** are only shown and persisted when `payMode === 'direct'`.

### Fonts

| Font | Use |
|------|-----|
| Syne 800 | Display headings, wordmark |
| Instrument Sans | Body text, inputs |
| JetBrains Mono | Labels, values, monospace data |

### Colours

| Token | Dark | Light |
|-------|------|-------|
| `--lime` | `#c8ff00` | `#7aaa00` |
| `--bg` | `#0a0a0a` | `#f2f2ee` |
| `--green` | `#00e676` | `#00994a` |
| `--amber` | `#ffab00` | `#c07800` |
| `--red` | `#ff3d57` | `#cc2233` |

---

## State shape

```json
{
  "onboarded": true,
  "householdName": "",
  "payMode": "joint | direct",
  "contributors": [
    {
      "id": "",
      "name": "",
      "type": "fixed | variable | both",
      "cycle": "weekly | fortnightly | monthly",
      "income": 0,
      "weeklyContrib": 0,
      "recurringOn": false,
      "recurringAmt": 0,
      "avatar": "(base64 data URL)"
    }
  ],
  "bills": [
    {
      "id": "",
      "name": "",
      "icon": "",
      "amount": 0,
      "freq": "weekly | fortnightly | monthly | quarterly | annual",
      "cat": "bills | childcare | living | subscriptions | debt | other",
      "dueDay": "1–28 | lastday | (day-of-week index for weekly/fortnightly)",
      "paidById": "",
      "fundedBy": [{ "id": "", "pct": 0 }],
      "payMethod": "auto | manual",
      "notes": "",
      "paidDate": "(ISO 8601 | null)"
    }
  ],
  "surplusRules": [
    {
      "id": "",
      "contributorId": "",
      "threshold": 0,
      "pct": 0
    }
  ],
  "sinkingFunds": [
    {
      "id": "",
      "name": "",
      "target": 0,
      "current": 0,
      "weeklyContrib": 0
    }
  ],
  "selPayday": 0,
  "billsPeriod": "weekly | monthly | annual"
}
```

---

## Key logic

| Function | Description |
|----------|-------------|
| `toWeekly(amount, freq)` | Converts any bill amount to weekly equivalent |
| `toWeeklyIncome(amount, cycle)` | Converts contributor income to weekly equivalent |
| `weeklyContribs()` | Sum of all contributors' `weeklyContrib` values |
| `weeklyBills()` | Sum of all bills via `toWeekly` |
| `surplus()` | `weeklyContribs() - weeklyBills()` |
| `billIsPaid(bill)` | Auto bills always return true; manual bills check `paidDate` against `billNeedsReset()` |
| `billNeedsReset(bill)` | Compares `paidDate` to now using the bill's frequency to determine if paid state should clear |
| `healthStatus()` | Returns label and colour class based on surplus, contributor count, and bill count |

---

## Versioning scheme

| Change | Version impact |
|--------|---------------|
| Bug fix, no feature change | Fourth decimal only — `v0.2.2` → `v0.2.2.1` |
| Feature addition or change | Third decimal, fourth resets — `v0.2.2.2` → `v0.3.0` |
| Testing-ready build | `v0.10.0` |
| Public beta | `v1.0.0` |

The `APP_VERSION` constant inside the file and the filename must always match exactly.

---

## Export and import

- Export writes the full state object to a `.json` file, including base64 avatars
- Import reads the file, merges with existing state shape (no fields lost), and always uses `setTimeout(fn, 0)` to escape the `FileReader` async context before any state mutation or dialog
- Storage key: `funded_data_v1`

---

## Alpha deployment

| | |
|-|-|
| Live URL | https://fundedalpha.netlify.app/ |
| Feedback form | https://forms.office.com/r/eCyJuX9JW9 |
| Current version | v0.2.2.2-alpha |

---

## Credits

```
Concept & Development: Anthony Paull
Built with Claude by Anthropic
```
