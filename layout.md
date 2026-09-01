---
name: layout
description: Layout design system for FE-POS-APP — bento-grid dashboards, glass chrome, responsive shell, and elevation rules.
---
# Layout Design System: FE-POS-APP

## Overview

**Creative North Star: "The Glass Ledger"**
Layout is the structural skeleton of the POS interface — supporting the data-dense, glass-morphism aesthetic without visual noise. The layout system is built on a **bento-grid shell** with fixed chrome, responsive Sidebar, and airy content areas. Every spacing, dimension, and breakpoint serves the goal: cashiers, kitchen staff, and managers read the truth in one glance.

---

## Shell & Page Structure

### Page Shell (Fixed Layout)

```html
<!-- Root layout wrapper -->
<div className="min-h-screen bg-background text-foreground">
  
  <!-- Sticky frosted header -->
  <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
      <h1 className="text-2xl font-bold">POS Dashboard</h1>
      <div className="flex items-center gap-2">
        <!-- User menu, notifications, search etc. -->
      </div>
    </div>
  </header>

  <!-- Main content area -->
  <div className="flex min-h-screen">
    
    <!-- Sidebar (fixed left) -->
    <aside className="w-64 border-r border-border/50 flex-shrink-0 bg-background/80 backdrop-blur-md flex flex-col max-h-screen">
      <!-- Collapsed/expanded navigation -->
    </aside>

    <!-- Content area -->
    <main className="flex-1 p-4 lg:px-6 overflow-x-auto">
      <!-- Page content flows here -->
    </main>
  </div>
</div>
```

### Page Padding & Outer Margin

- **Outer page margin**: `xl` (32px) via `container` or `mx-auto max-w-7xl`
- **Inner content padding**: `p-6` (24px) for cards/sections
- **Content column max-width**: `lg:max-w-7xl` for wide desktops

---

## Sidebar Navigation

### Desktop (`xl` and up)

- **Width**: `w-64` (240px)
- **Height**: `max-h-screen` with scrollable content
- **Background**: `bg-background/80 backdrop-blur-md`
- **Border**: `border-r border-border/50`
- **Nav items**: `rounded-xl`, 40px tall, 20px icons (Lucide)
- **States**:
  - Rest: `mist-ink text` (`text-muted-foreground`)
  - Hover: `mist fill + ink text` (`bg-muted text-ink`)
  - Active: `ink fill, ink-soft text, shadow-md` (`bg-primary text-primary-foreground shadow-primary/25`)
- **Group headings**: `text-[10px] uppercase tracking-wider text-muted-foreground` on `bg-muted/40`
- **Collapse/expand**: Below `xl`, sidebar becomes an overlay drawer

### Mobile (`sm`/`md`)

- **Hidden by default**: Hidden under `xl` breakpoint
- **Drawer overlay**: Fixed position, full height, slides in from left
- **Overlay background**: `bg-black/60 backdrop-blur-sm`
- **Sidebar content**: Full-width navigation with close button

---

## Content Grid & Bento Layout

### Bento Grid System

Information is grouped into "Bento Boxes" — clean, rounded rectangles with consistent spacing.

**Grid breakpoints:**
- **1 column**: `sm:` (mobile, under 640px)
- **2 columns**: `md:` (tablet, under 768px)
- **3 columns**: `lg:` (desktop, under 1024px)
- **4 columns**: `xl:` (large desktop, 1024px+)
- **5 columns**: `2xl:` (extra large, 1280px+)

**Column gutters**: `gap-6` (24px) standard; `gap-4` (16px) for compact rows

**Example bento grid:**
```html
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <!-- Stat cards / bento boxes -->
</div>
```

### Stat Card (Bento Box)

- **Corner radius**: `rounded-xl` (8px) or `rounded-2xl` (12px) for primary metric tiles
- **Background**: `bg-pearl` (light) / `bg-night-pearl` (dark)
- **Border**: `border border-border` (1px slate fence)
- **Internal padding**: `p-6` (24px)
- **Icon tile**: 56×56 `rounded-2xl` at `primary/10` opacity
- **Label**: `text-xs uppercase tracking-wider` (Inter, 12px)
- **Value**: `text-3xl font-bold` (Inter, 30px/36px)
- **Subtitle** (optional): `text-sm text-muted-foreground`

---

## Elevation & Depth

### Flat-By-Default Rule

No surface renders a resting shadow except the minimal card ground. Elevation is earned.

### Shadow Vocabulary

| Shadow | Usage | CSS |
|---|---|---|
| **Card at rest** | Minimal grounding | `shadow-sm` (`0 1px 2px 0 rgba(15,23,42,0.06)`) |
| **Hover lift** | Cards, interactive elements on hover | `shadow-md` (`0 4px 10px -2px rgba(15,23,42,0.08)`) |
| **Menus & popovers** | Dropdowns, popovers, command palette | `shadow-lg` + `shadow-md` combination |
| **Active nav** | Raised ink pill in sidebar | `shadow-md` (`0 4px 10px -2px rgba(15,23,42,0.25)`) |
| **Focus ring** | Interactive focus state | `outline-none ring-2 ring-primary-500 offset-2` (`steel-ring`) |

### Glass Chrome Rule

Frosted translucency (`bg-background/80 backdrop-blur-md`) belongs **only** to:
- Sticky header
- Overlaying drawer/sidebar

**Never** apply to static content cards, panels, or table surfaces.

---

## Spacing & Rhythm

### Spacing Scale

| Size | CSS | Purpose |
|---|---|---|
| `xs` | `4px` | Tight inline spacing |
| `sm` | `8px` | Small gaps, form control spacing |
| `md` | `16px` | **Standard spacing** (`p-4`, `gap-4`) |
| `lg` | `32px` | Page outer margin, section spacing |
| `xl` | `32px` | Container max-width outer margin |
| `2xl` | `32px` | Equivalent to `xl` in this system |

### Vertical Rhythm

- **Input height**: `h-10` (40px) standard; `h-9` (36px) for search variant
- **Table row height**: `h-12` (48px) header; `py-3.5` (14px) data cells
- **Card padding**: `p-6` (24px) standard; `p-4` (16px) compact
- **Section margin**: `mb-6` (24px) between sections/grids

### Horizontal Rhythm

- **Container max-width**: `max-w-7xl` (large) or `max-w-6xl` (compact)
- **Page padding**: `px-4 lg:px-6` (16px desktop, 4px mobile)
- **Sidebar width**: `w-64` (240px) fixed; drawer `sm:max-w-full`

---

## Tables

### Airy Table Design

**Principles:** Borderless rows, subtle hover, status chips only for semantics.

**Table Structure:**
```html
<table className="w-full divide-y divide-border">
  <thead>
    <tr>
      <th className="bg-muted/50 text-muted-foreground text-xs font-semibold uppercase tracking-wider">...</th>
    </tr>
  </thead>
  <tbody>
    <tr className="group hover:bg-accent/30 cursor-pointer">
      <td className="px-6 py-3.5 text-xs font-semibold tracking-wider">...</td>
      <!-- Status cells as halo pills -->
    </tr>
  </tbody>
</table>
```

**Header band**: `bg-muted/50 text-muted-foreground`
**Cells**: `text-xs font-semibold tracking-wider`
**Row separators**: `divide-y divide-border` (1px, slate fence)
**Sticky edge columns**: `sticky left-0 bg-card z-10` with directional hairline shadow

### Pagination

**Pagination band**: `px-4 py-3 border-t bg-muted/30`
- "Show entries" combobox + display info
- Page buttons: `rounded-lg` (4px), `h-10` (40px)
- Active: `bg-primary text-primary-foreground border-primary`
- Disabled: `opacity-30`
- First/last chevrons on both ends
- Max 5 visible pages with `…` ellipses

---

## Responsive Breakpoints

| Breakpoint | Width | CSS | When to Use |
|---|---|---|---|
| `sm` | 640px | `@media (min-width: 640px)` | Mobile phones |
| `md` | 768px | `@media (min-width: 768px)` | Tablets, small laptops |
| `lg` | 1024px | `@media (min-width: 1024px)` | Desktop monitors |
| `xl` | 1280px | `@media (min-width: 1280px)` | Large desktops |
| `2xl` | 1536px | `@media (min-width: 1536px)` | Extra large displays |

### Responsive Behaviors

- **Sidebar**: Hidden under `xl`, becomes overlay drawer
- **Tab list**: Wrap in `overflow-x-auto -mx-1 px-1 mb-4`, use `grid-cols-N` with `min-w-[N×160px]`
- **Header search**: Widens from icon-only to pill with `⌘K` hint at `lg`
- **Control migration**: Inline (desktop) → profile modal (mobile)
- **Bento grid**: 1→2→3→4→5 columns as screen grows

---

## Components & Patterns

### Nav Item (Sidebar)

```html
<!-- Active -->
<button className="rounded-xl h-40 px-4 flex items-center gap-3 bg-primary text-primary-foreground shadow-primary/25">
  <LucideIcon className="w-5 h-5" />
  <span className="hidden lg:block">Nav Label</span>
</button>

<!-- Hover (expanded sidebar) -->
<button className="rounded-xl h-40 px-4 flex items-center gap-3 bg-muted hover:bg-ink/10 hover:text-ink">
  <LucideIcon className="w-5 h-5" />
  <span>Nav Label</span>
</button>

<!-- Collapsed only -->
<span className="hidden lg:inline">Label</span>
```

### Chip / Status Pill

```html
<span className="rounded-full px-2 py-1 text-[10px] font-bold bg-green-100 text-green-700">
  SUCCESS
</span>
```

**Dark mode**: `bg-green-900/30 text-green-400`

### Tabs (Segmented Control)

**Tab track**: `h-10 rounded-md bg-muted p-1`
**Active trigger**: Raised pearl segment `bg-background text-foreground shadow-sm rounded-sm` over mist strip
**Validation dots**: 8px `rounded-full` dot on each trigger (`bg-green-500`, `bg-red-500`, `bg-muted-foreground/40`)

### Search Input Variant

```html
<div className="relative">
  <input 
    className="h-9 px-3 pr-9 w-full rounded-md border border-border text-sm"
    placeholder="Search..."
  />
  <MagnifyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
  <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hidden sm:block" />
</div>
```

---

## Do's and Don'ts

### Do:
- **Use ink** (`#0f172a` / dark `#f8fafc`) as the sole accent for primary actions, active states, links
- **Keep body copy** 14px and cards `p-6`; preserve the 4/6/8/12/16/pill radius ladder and 40px control height
- **Render status** as soft-tinted halo pills with `tracking-tight` mono numerals
- **Apply frosted glass** (`bg-background/80 backdrop-blur-md`) **only** on sticky header and floating chrome
- **Let rows lift** (`hover:bg-accent/30`) rather than add shadows to tables
- **Raise the active option** as a lifted pearl segment inside a mist track (tabs, language toggles)
- **Give empty and loading states** a home — 80px icon tile, centered `py-16`, `animate-pulse` mist skeletons
- **Use Tailwind's semantic tokens** (`bg-card`, `text-muted-foreground`, `border-border`) mapped to slate variables

### Don't:
- **Introduce a brand hue** or saturated primary into the staff POS — ink does the work
- **Use orphan Material-3 role tokens** (`primary-container`, `surface-container*`, etc.) — they are unused cruft
- **Use `#ff0000` or `#7f1d1d`** for anything but destructive semantics
- **Add a second typeface** — one Inter family, hierarchy through weight and size only
- **Render resting shadows** on static content, and never blur static cards
- **Invent radius values** outside the documented ladder (4/6/8/12/16/pill)
- **Use `justify-start h-12` on TabsList** — produces single non-wrapping row that breaks on mobile

---

## References

- **DESIGN.md** (full design system): colors, typography, components, elevation, shapes
- **UIUX_SPECIFICATION.md** (modernization blueprint): bento grid, glassmorphism, airy tables, interactions
- **PANDUAN-SUPER-ADMIN.md** (super-admin operating guide): layout-specific usage notes
- Tailwind config: map semantic tokens to `DESIGN.md` color variables