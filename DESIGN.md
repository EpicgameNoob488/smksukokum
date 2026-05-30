---
name: SM Konven St. Ursula Kokurikulum Dashboard
description: A warm, supportive dashboard for tracking PAJSK cocurriculum scores and managing student/teacher records.
colors:
  primary-red: "#F04444"
  text-navy: "#131f5d"
  text-muted: "#767681"
  main-bg: "#f7f9ff"
  card-outer-bg: "#f1f4fb"
  card-inner-bg: "#ffffff"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.15em"
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  xs: "0.625rem"
  sm: "0.75rem"
  md: "0.875rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.primary-red}"
    textColor: "{colors.card-inner-bg}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.5rem"
  button-primary-hover:
    backgroundColor: "#DC2626"
    textColor: "{colors.card-inner-bg}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1.5rem"
  card-default:
    backgroundColor: "{colors.card-inner-bg}"
    textColor: "{colors.text-navy}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input-default:
    backgroundColor: "{colors.card-inner-bg}"
    textColor: "{colors.text-navy}"
    rounded: "{rounded.full}"
    padding: "0.5rem 1rem"
  nav-active:
    backgroundColor: "{colors.card-inner-bg}"
    textColor: "{colors.primary-red}"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
  nav-inactive:
    backgroundColor: "transparent"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.625rem 1rem"
---

# Design System: SM Konven St. Ursula Kokurikulum Dashboard

## 1. Overview

**Creative North Star: "The Trusted Ledger"**

This design system treats the interface as a respectful, clean record-keeping surface. Every screen is a page in a well-kept grade book brought to life: dignified data, warm neutrals, and one confident accent that knows when to speak and when to stay quiet. The tool sits in the corner of a teacher's day — reliable, predictable, and gently warm. It earns its keep by being ignorable.

The aesthetic philosophy is one of supportive clarity. Every heading, label, and data point says exactly what it means. No branded metaphors, no gamified language, no tonal surprises. The cardinal red and deep indigo palette provides warmth without whimsy. Generous rounded corners and system fonts make the tool feel supportive, not sterile. Restraint is what separates warm from cloying.

This system explicitly rejects the generic-ed-tech clichés (cartoonish icons, blackboard motifs, childish colors) while also steering clear of cold enterprise-SaaS density. Familiarity and warmth over novelty. The tool should work like every other tool a teacher has used — because it uses the same affordances, the same patterns, the same quiet predictability.

**Key Characteristics:**
- Warmly efficient: friendly like a colleague, not cold like an enterprise tool
- Tactile and friendly: generous rounded corners, soft shadows, clear hover states
- Supportive clarity: every element says exactly what it means
- Familiar first: system fonts, standard controls, platform-native behaviors
- Data with dignity: clean, respectful presentation of student records

## 2. Colors

The palette is anchored by Cardinal Red and Midnight Navy, supported by a three-tier neutral surface system. Functional accents in orange, yellow, and crimson appear sparingly for status indicators and score badges.

### Primary
- **Cardinal Red** (`#F04444`): The single accent voice. Used for the sidebar background, primary buttons, active navigation pills, and key highlights. It carries authority and warmth simultaneously. On any given screen it occupies no more than 10% of the surface; its rarity is the point.

### Neutral
- **Midnight Navy** (`#131f5d`): Primary text, headings, and the logo wordmark. Deep and authoritative without being cold. Used wherever the eye needs to read or navigate.
- **Warm Muted Gray** (`#767681`): Secondary text, placeholders, inactive icons, and metadata. Softer than a pure gray, with a subtle warm cast that keeps the interface from feeling industrial.
- **Cool White** (`#f7f9ff`): The main canvas background. A very slightly blue-tinted white that reduces eye strain during long data-entry sessions.
- **Soft Cool Gray** (`#f1f4fb`): Outer card and panel backgrounds. One step darker than the main canvas, used to group related white cards into zones.
- **Pure White** (`#ffffff`): Inner card surfaces. The brightest layer, used for the actual content containers that hold data, forms, and tables.

### Functional Accents
The following colors are not structural accents; they are semantic and functional, used only for specific data states and score indicators.
- **Warm Orange** (`#FF7A59`): Progress indicators, secondary CTAs.
- **Amber** (`#FFB547`): Warning states, mid-range scores.
- **Crimson** (`#da3437`): Critical alerts, low scores, error text.
- **Fresh Green** (`#059669` / `#D1FAE5`): Success states, high attendance, good scores.
- **Alert Red** (`#DC2626` / `#FEE2E2`): Danger states, low attendance, failing scores.

### Named Rules
**The One Voice Rule.** Cardinal Red is the only accent on primary actions, active navigation, and key highlights. It appears on no more than 10% of any given screen. Its rarity is the point.

## 3. Typography

**Display Font:** System sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`)
**Body Font:** Same system sans stack.
**Label Font:** Same system sans stack.

**Character:** A single warm sans-serif family carries every role. Weight contrast creates hierarchy, not font switching. The stack is chosen for native feel across platforms — teachers should never wonder what font they're looking at.

### Hierarchy
- **Display** (900, 2.25rem, line-height 1.1): Hero headlines on the landing page. Tight tracking (`-0.025em`). Used sparingly — once per page at most.
- **Headline** (800, 1.5rem, line-height 1.2): Page titles and dashboard section headers. Tight tracking (`-0.02em`).
- **Title** (700, 1.25rem, line-height 1.3): Card titles, table headers, modal headings.
- **Body** (500, 0.875rem, line-height 1.6): Form labels, descriptive text, data cells. Max line length 65ch for prose blocks; tables and compact UI can run denser.
- **Label** (600, 0.625rem, line-height 1.2, letter-spacing 0.15em, uppercase): Pills, badges, navigation labels, metadata, table column headers. Wide tracking compensates for small size and maintains legibility.

### Named Rules
**The Size-Contrast Rule.** Hierarchy is created through weight contrast (at least 300 difference between adjacent roles) and case changes, not through font-size jumps alone.

## 4. Elevation

The system uses subtle ambient depth as its default. Cards float slightly above their containers with a soft, navy-tinted diffuse shadow; everything else sits flat at rest. Depth is never decorative. Shadows appear only to clarify layering and respond to interaction (hover). There are no hard directional shadows, no glass blur, and no elevation for purely chromatic surfaces like the red sidebar.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 24px 24px rgba(19,31,93,0.03)`): Default shadow for data cards and content containers. Barely perceptible, just enough to lift the surface.
- **Card Hover** (`box-shadow: 0 24px 24px rgba(19,31,93,0.08)`): Elevated shadow on card hover. Indicates interactivity without a color shift.
- **Modal Elevation** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`): Dialogs and modals. The deepest layer, used sparingly and only for true overlay content.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus) or to separate distinct layers (cards on panels).

## 5. Components

### Buttons
- **Shape:** Pill or softly rounded rectangle (`rounded-md` / 0.75rem or `rounded-full` / 9999px).
- **Primary:** Cardinal Red background (`#F04444`), Pure White text, bold weight, generous horizontal padding (16px–48px).
- **Hover / Focus:** Background darkens to `#DC2626`; transition 150ms ease. Focus ring: 2px `rgba(254,226,226,1)` (`red-200`) outline.
- **Ghost / Secondary:** Transparent background, Midnight Navy text, hover background `rgba(19,31,93,0.05)`.

### Chips / Filter Pills
- **Style:** Pure White background, Midnight Navy text, 1px `slate-200` border, `rounded-full` (9999px).
- **State:** Selected state uses Cardinal Red text and border. Hover background `slate-50`.
- **Smart Filter Pill:** A filter pill whose dropdown options are dynamically scoped to the currently selected academic year. Only values that have matching students in that year are shown. This is the primary discovery mechanism in the Students tab.

### Cards / Containers
- **Corner Style:** Generous rounding (`rounded-xl` / 0.75rem to `rounded-2xl` / 1rem).
- **Background:** Pure White inner card on Soft Cool Gray (`#f1f4fb`) outer panel.
- **Shadow Strategy:** Card Rest at default; Card Hover on mouseover.
- **Border:** None by default; 1px `slate-200` on inputs and pills only.
- **Internal Padding:** 1.5rem (24px) typical.

### Inputs / Fields
- **Style:** White background, 1px `slate-200` border, `rounded-full` (9999px) or `rounded-xl`.
- **Focus:** 2px `red-200` ring, border color shifts toward Cardinal Red.
- **Error / Disabled:** Error uses `red-50` background + `red-600` text. Disabled uses muted text at reduced opacity.

### Navigation
- **Style:** Solid Cardinal Red sidebar (`#F04444`), white text, compact width (14rem / 224px).
- **Default:** Transparent background, white text, hover `bg-white/10`.
- **Active:** White pill background, Cardinal Red text, `rounded-xl`.
- **Mobile:** Collapsible drawer, same treatment.

### Smart Filter Pill
- **Description:** A `rounded-full` pill button that opens a dropdown. Its options are computed from the currently selected year only; options with no matching students are hidden. The pill shows the current selection or "All [Category]". This component is the signature interaction of the Students tab.

## 6. Do's and Don'ts

### Do:
- **Do** use Cardinal Red for primary actions, active navigation states, and key highlights only.
- **Do** maintain the three-tier surface system: Cool White canvas → Soft Cool Gray panels → Pure White cards.
- **Do** use generous rounded corners (12px–24px) on cards and containers to reinforce the friendly, tactile feel.
- **Do** keep labels uppercase with wide letter-spacing (0.15em) at small sizes (10px) for metadata and pills.
- **Do** use the Smart Filter Pill pattern for year-scoped filtering; it keeps data discovery contextual and prevents empty states.
- **Do** ensure all interactive elements have visible focus indicators (2px red-200 ring minimum).

### Don't:
- **Don't** use generic ed-tech cartoonish icons, blackboard motifs, or childish colors. From PRODUCT.md: "avoid the generic-ed-tech cliches."
- **Don't** create cold enterprise-SaaS density. The tool should feel warm and supportive, not sterile.
- **Don't** use border-left or border-right greater than 1px as a colored accent on cards, list items, or alerts.
- **Don't** use gradient text (`background-clip: text`) or glassmorphism as a default.
- **Don't** use the hero-metric template (big number, small label, supporting stats, gradient accent).
- **Don't** create identical card grids with icon + heading + text repeated endlessly.
- **Don't** reach for a modal as the first solution. Exhaust inline and progressive alternatives first.
- **Don't** use display fonts for UI labels, buttons, or data.
- **Don't** reinvent standard affordances for flavor (custom scrollbars, weird form controls, non-standard modals).
