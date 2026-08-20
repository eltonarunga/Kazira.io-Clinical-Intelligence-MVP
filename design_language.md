# Kazira Clinical Intelligence — Design Language System

**Version:** 1.0.0  
**Target Platform:** Web (Kenyan Private Clinics & Public/Faith-Based Healthcare Facilities)  
**Framework:** Tailwind CSS, React 18, Strict TypeScript, Lucide React Iconography  

---

## 1. Core Principles

1. **Healthcare Clarity & Mathematical Precision:**
   - Visual hierarchy prioritizes clinical and financial legibility without clutter or decorative noise.
   - High contrast ratios (WCAG AA compliant) across all data visualization, tables, and metrics.
   - Transparent, deterministic numbers with unambiguous formatting.

2. **Currency Consistency (KES Standard):**
   - **All financial metrics must be prefixed with `KES`** (e.g., `KES 1,250,000`), never `$`, USD, or unadorned integer strings.
   - Monetary values use monospace font numerals (`font-mono font-bold`) for tabular alignment and scannability.

3. **Public/Private Split & Segment Cohesion:**
   - Private clinics: Focus on unbilled revenue recovery, MRR protection, and practitioner performance.
   - Public / Faith-based facilities: Focus on SHA claim turnaround, OpenMRS FHIR synchronization, and KDPA 2019 data governance.
   - Both segments share the identical underlying design system, tokens, typography, and card geometry.

4. **KDPA 2019 Privacy & Pseudonymisation Signifiers:**
   - Security badges (`KDPA 2019 Compliant`, `SHA-256 Masked`) use distinctive, calming emerald and forest green accents.

---

## 2. Design Tokens & Palette

### Backgrounds & Surfaces
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `surface` | `#faf9f6` | Warm off-white primary application canvas, cards, and modal bodies |
| `surface2` | `#f0eee6` | Secondary panels, table headers, form input backgrounds, subtler containers |
| `surface3` | `#e4e1d6` | Hover states, tab dividers, active selector highlights |
| `border` | `#d4d4d4` | Standard card dividers, outer boundaries |
| `border2` | `#e5e5e5` | Subtle internal borders, table grid lines |

### Typography & Ink
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `ink` | `#111110` | Primary headings, KPI values, high-emphasis text |
| `ink2` | `#3d3d38` | Secondary headings, strong table row labels, form labels |
| `ink3` | `#6b6b65` | Muted descriptions, metric sublabels, table header titles |

### Semantic & Functional Accents
| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `accent` | `#1d6b4a` | Kazira Forest Green: Primary actions, brand mark, key charts, primary buttons |
| `accent2` | `#2d9b6a` | Lighter Forest Green: Active badges, progress indicators, online status |
| `accent-light`| `#e8f5ef`| Soft green tint for highlights, attribution tags, callouts |
| `accent-pale` | `#f2faf6` | Extremely subtle tinted card backgrounds |
| `warn` | `#b85c1a` | Warning / Alert: Cancellations, overdue debt, unbilled risks |
| `warn-light` | `#fdf3eb` | Warning background tint |
| `gold` | `#c49a2a` | Secondary accent, premium milestones, high-value highlights |

---

## 3. Typography Hierarchy

### Font Families
- **Display & Section Headings (`font-serif`):** `DM Serif Display`, Georgia, serif  
  *Usage:* Page titles, modal titles, major card headers (`text-2xl font-bold font-serif text-ink`).
- **Body & Controls (`font-sans`):** `Outfit`, system-ui, sans-serif  
  *Usage:* General body text, form controls, buttons, tooltips (`text-sm text-ink2`).
- **Numerical & Tabular Data (`font-mono`):** `DM Mono`, monospace  
  *Usage:* Currency amounts, patient reference codes, timestamps, percentages (`font-mono font-bold text-ink`).

### Type Scale
- **H1 (Hero / Main Title):** `text-3xl md:text-5xl font-black font-serif tracking-tight text-ink`
- **H2 (Section Titles):** `text-2xl font-bold font-serif tracking-tight text-ink`
- **H3 (Card / Modal Headings):** `text-lg font-bold font-serif text-ink`
- **KPI Large Numerals:** `text-2xl md:text-3xl font-bold font-mono text-ink`
- **Body Regular:** `text-sm text-ink2 leading-relaxed`
- **Subtext / Captions:** `text-xs text-ink3`
- **Micro / Badges / Table Headers:** `text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-ink3`

---

## 4. Component Standards

### 1. Buttons (`components/Button.tsx`)
Buttons follow standardized variant styles and padding ratios (horizontal padding is ~2x vertical padding):
- `primary`: `bg-accent text-white hover:bg-accent/90 border border-transparent shadow-sm rounded-xl font-bold`
- `secondary`: `bg-surface2 text-ink hover:bg-surface3 border border-border2 hover:border-border rounded-xl font-bold`
- `outline`: `bg-transparent text-ink hover:bg-surface2 border border-border hover:border-ink rounded-xl font-bold`
- `ghost`: `bg-transparent text-ink hover:bg-surface2 border-transparent rounded-xl font-bold`
- `danger`: `bg-rose-600 text-white hover:bg-rose-700 shadow-sm rounded-xl font-bold`

### 2. Metric & KPI Cards
- Single-level card hierarchy with `bg-surface rounded-2xl border border-border2 p-5 shadow-sm space-y-2`.
- Top row: Subtitle uppercase with icon (`text-xs font-semibold text-ink3 flex justify-between items-center`).
- Main figure: `text-2xl md:text-3xl font-bold font-mono text-ink`.
- Bottom trend: `text-xs font-medium` with positive emerald (`text-emerald-600`) or negative rose (`text-rose-600`).

### 3. Data Tables & Ledgers
- Wrapper: `bg-surface border border-border2 rounded-xl overflow-hidden shadow-sm`.
- Table header: `bg-surface2/80 text-ink3 uppercase font-bold text-[10px] tracking-wider border-b border-border2 px-4 py-3`.
- Table rows: `hover:bg-surface2/40 transition-colors border-b border-border2`.
- Numeric columns: Right-aligned or clear monospace format (`font-mono font-bold`).

### 4. Status Badges & Pills
Text inside badges sits on a single line (`whitespace-nowrap font-bold text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5`):
- **Collected / Approved / Verified:** `bg-emerald-50 text-emerald-800 border border-emerald-200`
- **Pending / Action Needed:** `bg-rose-50 text-rose-700 border border-rose-200`
- **Escalated / In Progress:** `bg-amber-50 text-amber-700 border border-amber-200`
- **Dismissed / Manual:** `bg-surface2 text-ink3 border border-border2`
- **Kazira Auto-Flagged:** `bg-accent-light text-accent border border-accent/20`

### 5. Modals & Dialogs (`components/Modal.tsx`)
- Backdrop: `fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4`.
- Dialog container: `bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-border`.
- Modal header: `p-4 sm:p-6 border-b border-border flex justify-between items-center`.
- Modal title: `text-lg font-bold font-serif text-ink`.
- Modal body: `p-6 overflow-y-auto flex-1 text-sm text-ink2`.

---

## 5. Mobile & Responsive Layout Rules
- Header: Sticky navigation with mobile-friendly icon actions and responsive tab scroller (`overflow-x-auto`).
- Minimum touch targets: 44px on mobile viewport.
- Card Grids: Single column on small screens (`grid-cols-1`), progressing smoothly to `md:grid-cols-2` and `lg:grid-cols-4`.
- Recharts visualizations: Wrapped in `<ResponsiveContainer width="100%" height="100%">` with defensive sizing.

---

## 6. Design Audit Checklist
- [x] No bare `$` signs for Kenyan healthcare data — all financial figures format as `KES X,XXX`.
- [x] Fonts correctly paired (`DM Serif Display` for headings, `Outfit` for body, `DM Mono` for numbers/codes).
- [x] Backgrounds adhere strictly to `#faf9f6` canvas with `#f0eee6` surfaces.
- [x] Modals, forms, and buttons share standard radius (`rounded-xl` / `rounded-2xl`).
- [x] Dark borders and text colors conform to semantic tokens (`ink`, `ink2`, `ink3`, `border`, `border2`).
- [x] Icons consistently imported from `lucide-react`.
