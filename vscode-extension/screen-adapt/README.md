# Screen Adapt

Responsive CSS scaffolding for VS Code. Write your base CSS, run the command, and Screen Adapt generates the responsive variants automatically. A PostCSS plugin compiles the custom syntax to standard media queries at build time.

No changes to JSX. No new layout system. No runtime cost.

---

## Requirements

The PostCSS plugin is required to compile the custom syntax at build time.

```bash
npm install screen-adapt
```

Add it to your PostCSS config:

```js
module.exports = {
  plugins: [
    require('screen-adapt')
  ]
}
```

---

## Setup

Open any CSS file and press `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows), or run:
Screen Adapt: Initialise @screens

This inserts a default `@screens` block at the top of the file:

```css
@screens {
  mob-ver: (max-width: 30em) and (orientation: portrait);      /* ~480px */
  mob-hor: (max-width: 52.75em) and (orientation: landscape);  /* ~844px */
  tab-ver: (max-width: 64em) and (orientation: portrait);      /* ~1024px */
  tab-hor: (max-width: 64em) and (orientation: landscape);     /* ~1024px */
  desk-ver: (min-width: 65em) and (orientation: portrait);     /* ~1040px */
}
```

Remove or comment out any screen sizes you don't need. Whatever remains gets scaffolded.

---

## Usage

### Single selector

Place your cursor inside any CSS selector and press `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows). Screen Adapt scaffolds responsive variants for that selector only.

You can also right-click and select **Screen Adapt: Add screen variants**.

### All selectors

Press `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows) to scan the entire file and scaffold all selectors at once. Selectors that already have variants are skipped. A comment block is added below `@screens` listing any skipped selectors.

---

## How values are generated

**Numeric properties** (`width`, `height`, `padding`, `margin`, `max-width`, `max-height`, `font-size`) are scaled proportionally from a 1440px desktop base to the target screen size and converted to relative units.

**Structural properties** (`grid-template-columns`, `flex-direction`, `display: grid`) use predefined templates — collapsing columns on mobile, switching flex direction, and so on.

**Everything else** is copied as-is with a `/* check sizing */` comment so you know to review it.

---

## Notes

- The `@screens` block is per-file. Different stylesheets can target different screen sets.
- Variants are never overwritten. Remove existing variants manually before re-scaffolding.
- Breakpoints use `em` units so they scale with the user's font size preference.
- To hide an element on a specific screen size, set `display: none` in that variant block. The PostCSS plugin compiles it to a standard media query and the browser handles the rest.