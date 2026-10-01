# Kazira Design System

> **"The A has no crossbar. Kazira shows the gap."**

**Version:** 2.0.0  
**Target Platform:** Web (Kenyan Private Healthcare Clinics & Public/Faith-Based Facilities)  
**Fonts:** Sora (`headings`, `figures`) & Source Sans 3 (`body`, `tables`)  
**Accessibility:** WCAG AA Compliant in both Light and Dark modes  

---

## 1. Design Language & Philosophy

The wordmark sets the rules: black and white, wide even strokes, and two open **A** shapes where a crossbar would sit. That opening becomes the fundamental idea behind the product.

```
       ▲                   ▲
      / \                 / \
     /   \               /   \
    /     \             /     \
   / - - - \           / - - - \  <-- The dashed bar marks the gap
  /         \         /         \
 /           \       /           \
```

### The Four Core Principles

1. **Show the Gap**  
   Missing money is drawn as a dashed outline where revenue should be. The clinic owner or medical superintendent sees what is absent before reading a single number. Unbilled clinical procedures and lost billing items are immediately visualised as tangible gaps waiting to be closed.

2. **Black and White First**  
   Every screen works in monochrome. Generous space, clean geometric contrast, and calm typography do the heavy lifting. Color never exists for decorative noise—color appears **only** when it carries meaning about money and revenue integrity.

3. **Say the Action**  
   Every insight ends with the direct next step, in a sentence a doctor, clinician, or practice manager can act on between patients. No vague analytics jargon; just clear, decisive instructions.

4. **Calm and Exact**  
   Generous breathing room, tabular numbers, no urgency theatre or flashing alarms. Kenyan healthcare administrators handle high-stakes clinical and financial operations; trust in the deterministic weekly reconciliation report is the product.

---

## 2. Logo & Brand Mark

### Official Healthcare Shield Emblem (Primary Emblem)
The official emblem combines clinical authority, sovereign data defense, and financial recovery for Kenyan healthcare institutions:
- **Left Shield Frame:** Forest Green (`#0d5d3a`) representing statutory KDPA 2019 compliance, patient confidentiality, and clinical defensibility.
- **Right Shield Frame & Upward Trend Arrow:** Warm Ochre Gold (`#c58c2b`) representing recovered clinical revenue, SHA reconciliation, and financial longevity.
- **Central Staff & Serpents:** Entwined Caduceus serpent coils and vertical clinical staff with ring terminal symbolizing medical excellence and healthcare governance.

#### Vector Definition:
```xml
<svg viewBox="0 0 160 160" role="img" aria-label="Kazira Clinical Intelligence Emblem" fill="none">
  <!-- 1. Left Shield Frame (Forest Green) -->
  <path d="M 68 36 L 42 36 C 30 36 24 42 24 54 L 24 88 C 24 102 36 118 64 126" stroke="#0d5d3a" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 2. Right Shield Wall (Warm Gold) -->
  <path d="M 92 36 L 118 36 C 130 36 136 42 136 54 L 136 86" stroke="#c58c2b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 3. Bottom Recovery Arrow (Warm Gold) -->
  <path d="M 44 126 L 68 140 L 126 90" stroke="#c58c2b" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 112 88 L 132 86 L 130 106" stroke="#c58c2b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- 4. Central Staff with Ring Terminal (Forest Green) -->
  <circle cx="80" cy="24" r="7" stroke="#0d5d3a" stroke-width="7" fill="none"/>
  <path d="M 80 34 L 80 128" stroke="#0d5d3a" stroke-width="8" stroke-linecap="round"/>
  <!-- 5. Entwined Caduceus Serpents -->
  <path d="M 80 50 C 64 42 42 46 42 58 C 42 70 66 74 80 78" stroke="#0d5d3a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 80 50 C 96 42 118 46 118 58 C 118 70 94 74 80 78" stroke="#c58c2b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 80 78 C 62 82 48 88 48 98 C 48 110 68 114 80 126" stroke="#0d5d3a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 80 78 C 98 82 112 88 112 98 C 112 110 92 114 80 126" stroke="#c58c2b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Official Wordmark
The wordmark uses custom geometric letterforms where the letter **A** has no crossbar, symbolising the unbilled procedure gap.

- **Application:** Use the wordmark in white on black or black on white.
- **Clear Space:** Clear space equals the height of the letter **I** on every side.
- **Minimum Width:** 96 px.
- **Vector Definition:**
```xml
<svg viewBox="60 515 670 140" role="img" aria-label="Kazira wordmark" fill="currentColor">
  <!-- K -->
  <path d="M68 527H90V640H68Z"/>
  <path d="M146 527H170L124 580L173 640H146L105 590Q100 582 106 575Z"/>
  <!-- A (No crossbar - shows the gap) -->
  <path d="M226 527H251L299 640H275L237 549L201 640H180Z"/>
  <!-- Z -->
  <path d="M317 527H405V547L341 622H404V640H315V622L380 544L317 546Z"/>
  <!-- I -->
  <path d="M437 527H459V640H437Z"/>
  <!-- R -->
  <path d="M494 527H548Q584 527 584 561Q584 585 558 595L590 640H564L532 594H514V578H540Q560 575 560 561Q560 547 545 546H514V640H494Z"/>
  <!-- A (No crossbar - shows the gap) -->
  <path d="M645 527H670L718 640H694L656 549L620 640H599Z"/>
</svg>
```

---

## 3. Color Tokens & Palette

Neutrals do almost all the work. Marigold and red each mean one thing and appear only in data.

| Token | Light Theme | Dark Theme | Role & Semantic Meaning |
| :--- | :--- | :--- | :--- |
| `--bg` | `#FFFFFF` | `#0E0E0E` | Brand background and page surface |
| `--surface` | `#F4F4F2` (Paper) | `#171717` (Graphite) | Panels, cards, and modal canvases |
| `--ink` | `#0E0E0E` | `#F5F5F3` | Primary text, titles, headings, and high emphasis |
| `--ink2` | `#5C5C5C` (Ash) | `#A0A0A0` | Secondary text, subtitles, table headers, form labels |
| `--line` | `#DEDEDA` | `#2A2A2A` | Structural borders, card outlines, table gridlines |
| `--btn-bg` | `#0E0E0E` | `#FFFFFF` | Primary interactive button background |
| `--btn-fg` | `#FFFFFF` | `#0E0E0E` | Primary interactive button foreground text |
| `--recover` | `#E5A11C` (Marigold) | `#E5A11C` | **Recovered revenue** *(Always carries black text `#0E0E0E`)* |
| `--leak` | `#C4372A` (Leak red) | `#F0705F` | **Missed billing & unbilled gaps** |
| `--leak-bg` | `#FBEAE7` | `#331B18` | Soft background for unbilled alerts, gap rows, and cards |
| `--ok` | `#1F7A4F` (Billed green) | `#5FC496` | **Confirmed / billed / reconciled revenue** |
| `--ok-bg` | `#E4F2EB` | `#15291F` | Verified status badges and cleared bill containers |
| `--focus` | `#1B6FD1` | `#7DB4F5` | Focus ring for keyboard accessibility (`3px solid`) |

### Accessibility Rules (WCAG AA)
- **Marigold Rule:** Marigold (`#E5A11C`) **always** carries black text (`#0E0E0E`), never white.
- **Theme Pairs:** All text and background pairs meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- **Reduced Motion:** If `prefers-reduced-motion: reduce`, dashed gap animations pause cleanly.

---

## 4. Typography System

- **Headings & Figures (`--head`):** `Sora`, `Trebuchet MS`, sans-serif. Used in sentence case.
- **Body & Tables (`--body`):** `Source Sans 3`, `Segoe UI`, Arial, sans-serif.
- **All Caps Discipline:** All-caps is reserved strictly for the wordmark and compact system badges (`KDPA`, `SHA`).

### Type Scale
| Level | Font & Weight | Size / Line-Height | Tracking | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | Sora 700 | `clamp(32px, 8vw, 56px) / 1.05` | `-0.03em` | Primary KPI totals: `KES 48,200` |
| **Heading 2** | Sora 700 | `28px / 1.15` | `-0.02em` | Section headings: `Where you lost money` |
| **Heading 3** | Sora 600 | `18px / 1.25` | `-0.01em` | Panel titles & card headers |
| **Body Large** | Source Sans 3 400 | `16px / 1.55` | `normal` | Body explanations, instructions, descriptions |
| **Small / Hint** | Source Sans 3 400 | `14px / 1.45` | `normal` | Sub-labels, hints, helper text (`color: var(--ink2)`) |
| **Tabular** | Sora / Source Sans | `15px / 1.35` | `tabular-nums` | Table amounts, currency figures, MFL codes |

---

## 5. Component Patterns

### 1. The Gap Card (`.gapc`)
Visualises lost revenue with a solid leak-red spine and dashed gap border:
```html
<div class="panel gapc">
  <div class="chip leak">Unbilled Procedure Gap</div>
  <div class="big">KES 14,500</div>
  <p>Encounter completed without pharmacy or procedure line items on invoice.</p>
</div>
```
- **CSS:** `border-left: 6px solid var(--leak); border-radius: 6px 14px 14px 6px;`

### 2. Say the Action (`.say`)
Every clinical and financial insight finishes with an immediate actionable instruction:
```html
<div class="say">
  <div>
    <em>Action to take</em>
    Add suture tray (KES 2,500) to invoice #4829 before submitting to SHA.
  </div>
</div>
```

### 3. Chips and Status Pills
- **Missed / Leak:** `.chip.leak` (`background: var(--leak-bg); color: var(--leak);`)
- **Recovered:** `.chip.rec` (`background: var(--recover); color: #0E0E0E; font-weight: 700;`)
- **Billed / Reconciled:** `.chip.ok` (`background: var(--ok-bg); color: var(--ok);`)

### 4. Interactive Buttons
- **Primary:** `.btn` (`background: var(--btn-bg); color: var(--btn-fg); min-height: 44px; padding: 11px 18px; border-radius: 6px; font-weight: 600;`)
- **Secondary:** `.btn.sec` (`background: transparent; color: var(--ink); border: 1px solid var(--ink2); min-height: 44px;`)
- **Focus State:** `:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }`

### 5. Financial Data Tables
- Clean horizontal borders (`1px solid var(--line)`).
- Monospaced / tabular right-aligned numeric figures (`td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; }`).
- Missed revenue rows highlighted with `tr.miss td { background: var(--leak-bg); }`.

---

## 6. Kenyan Healthcare Specifics

1. **Currency Representation:**
   All monetary amounts are strictly formatted with `KES` (e.g., `KES 184,200`), never unadorned digits or `$`.
2. **Data Privacy (KDPA 2019):**
   Patient names and IDs are pseudonymised client-side using SHA-256 HMAC before rendering.
3. **Public/Private Adaptability:**
   - Private Facilities: Emphasises **MRR Protection** and **Unbilled Procedure Recovery**.
   - Public & Faith-Based: Emphasises **SHA Claim Scrubbing**, **OpenMRS FHIR**, and **County DHIS2 compliance**.

---

## 7. Implementation Checklist

- [x] Sora & Source Sans 3 imported via Google Fonts.
- [x] CSS variables defined on `:root` and `:root[data-theme="dark"]`.
- [x] Official Kazira Healthcare Shield Emblem (Caduceus & Upward Recovery Arrow in Forest Green & Gold) implemented in SVG.
- [x] Official Kazira Wordmark ("A has no crossbar") implemented in SVG.
- [x] Tabular numerals applied to all currency fields.
- [x] Marigold `#E5A11C` enforced with `#0E0E0E` dark text.
- [x] 44px touch targets on buttons, inputs, and navigation elements.
- [x] "Say the action" card patterns applied to all audit and gap listings.
