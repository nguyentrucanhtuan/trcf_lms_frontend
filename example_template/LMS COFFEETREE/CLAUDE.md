# CoffeeTree LMS — Project Instructions

This project is a learning-management-system (LMS) UI. All pages share one design system, established in `LMS CoffeeTree.html`. Reuse it for every new page.

## Design System (apply to ALL new pages)

### Stylesheet
Always include the shared stylesheet at the top of every new HTML file:

```html
<link rel="stylesheet" href="styles/design-system.css" />
```

For pages in subfolders, adjust the relative path (e.g. `../styles/design-system.css`).

The stylesheet imports Roboto + Material Symbols Outlined automatically and defines all tokens + base components.

### Typography
- **Font family**: Roboto, weights 300 / 400 / 500 / 700 — used for everything
- **Icons**: Material Symbols Outlined (use `<span class="ms">icon_name</span>`; add `.fill` for filled variant, `.sm` / `.lg` / `.xl` for sizes)
- **No serif, no display fonts.** Keep it minimal.

### Color tokens (CSS variables — already in design-system.css)
| Token | Value | Use |
|---|---|---|
| `--primary` | `#0d59f2` | Active state, CTAs, links, progress, brand |
| `--primary-soft` | `#e6efff` | Hover backgrounds, active row tints |
| `--bg` | `#f5f6f8` | Page background |
| `--surface` | `#ffffff` | Cards, panels, top bar |
| `--ink` | `#0f172a` | Primary text |
| `--ink-2` | `#475569` | Secondary text |
| `--ink-3` | `#94a3b8` | Muted text, placeholder icons |
| `--line` | `#e2e8f0` | Borders |
| `--line-2` | `#f1f5f9` | Subtle dividers, hover fills |
| `--done` | `#10b981` | Completed states |
| `--warn` | `#f59e0b` | Quiz / pending |

**Do not introduce new accent colors.** Stick to this palette.

### Layout patterns
- **Top bar**: sticky, white, 65px tall, with logo (blue M SVG) + title left, optional progress bar center, actions + avatar right
- **Two-column page**: `1fr 400px` grid, sidebar on right with `border-left: 1px solid var(--line)`, sidebar background `var(--bg)`
- **Page padding**: `32px` on stage content, `20-22px` on sidebar
- **Card radius**: `12px` for large surfaces, `8px` for buttons/inputs, `999px` for pills/avatars

### Components ready in the stylesheet
- `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-outline` / `.btn-sm` / `.btn-icon`
- `.topbar` with `.brand`, `.logo-mark`, `.avatar`, `.progress`
- `.card`, `.panel-title`, `.section-title`
- `.tag` + `.tag-primary` / `.tag-done` / `.tag-warn`
- `.field` (inputs)
- `.scroll` (custom scrollbar)
- `.ms` (Material Symbols)

### Minimalism rules
- **No gradients on UI surfaces.** (Subtle gradients on the avatar only.)
- **No emoji.** Use Material Symbols.
- **No serif headers.** Roboto Bold is the heaviest treatment.
- **Shadows are restrained**: `--shadow-sm` for cards, `--shadow-cta` only on primary buttons, `--shadow-md` rarely.
- **Borders > shadows** for separating regions.
- **One blue.** Don't tint or shade `--primary` arbitrarily — use `--primary-soft` for fills, `--primary-hover` for hovers.

### Reference page
`LMS CoffeeTree.html` is the canonical example of the system in use. Read it before building any new page, and match its structural choices (top bar layout, sidebar pattern, button styling, list-item shape).

## File naming
- New pages: descriptive names like `Dashboard.html`, `Course Catalog.html`, `Quiz.html`, `Profile Settings.html`
- Pass `asset: "<page name>"` to `write_file` so it appears in the review pane
- Keep all pages at project root so links between them are simple relative URLs

## Cross-page linking
Use plain `<a href="Page Name.html">` for navigation between LMS pages.
