# Screen Adapt

Responsive scaffolding for VS Code. Write your base CSS or Tailwind classes, run the command, and Screen Adapt generates the responsive variants automatically. A PostCSS plugin compiles the custom CSS syntax to standard media queries at build time.

No changes to JSX. No new layout system. No runtime cost.

---

## Requirements

Screen Adapt requires the PostCSS plugin to compile the custom CSS syntax at build time.

When the extension activates, it checks whether `screen-adapt` is installed in your project. If not, it prompts you to install it automatically. You can also install it manually:

```bash
npm install screen-adapt
```

Then create a PostCSS config file in your project root. If your project has `"type": "module"` in `package.json`, the file must be named `postcss.config.cjs`. Otherwise, `postcss.config.js` works.

```js
const screenAdapt = require('screen-adapt')

module.exports = {
  plugins: [screenAdapt.default || screenAdapt]
}
```

The `screenAdapt.default || screenAdapt` handles the ES module interop. Using `require('screen-adapt')` directly will throw a PostCSS plugin error.

The PostCSS plugin is only required for the CSS workflow. The Tailwind workflow does not need it.

---

## CSS workflow

### Setup

Open any CSS file and press `Cmd+Shift+I` (Mac) or `Ctrl+Shift+I` (Windows), or run **Screen Adapt: Initialise @screens**.

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

### Single selector

Place your cursor inside any CSS selector and press `Cmd+Shift+S` (Mac) or `Ctrl+Shift+S` (Windows). Screen Adapt scaffolds responsive variants for that selector only.

You can also right-click and select **Screen Adapt: Add screen variants**.

### All selectors

Press `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows) to scan the entire file and scaffold all selectors at once. Selectors that already have variants are skipped. A comment block is added after the imports listing any skipped selectors.

---

## Tailwind workflow

Screen Adapt reads your breakpoints from `tailwind.config.ts` or `tailwind.config.js` in the workspace root. No setup step required — just write your base Tailwind classes and run the command.

`theme.screens` is used if defined. Falls back to `theme.extend.screens`. If neither exists, or if the config uses spreads or dynamic imports that can't be resolved, the command will show an error.

### Single element

Place your cursor inside a `className` string on any JSX/TSX element and press `Cmd+Shift+T` (Mac) or `Ctrl+Shift+T` (Windows). Screen Adapt scaffolds responsive variants for that element only.

Both static strings and expression syntax are supported:

```tsx
className="w-96 p-4 text-base"
className={"w-96 p-4 text-base"}
```

You can also right-click and select **Screen Adapt: Add Tailwind variants**.

### All elements

Press `Cmd+Shift+E` (Mac) or `Ctrl+Shift+E` (Windows) to scan the entire file and scaffold all elements at once. Elements that already have variants are skipped.

After the scan, two comments are added to the file:

**Skipped elements** — inserted after the imports, lists elements that already had variants:
```tsx
/* screen-adapt: skipped elements (already have variants)
   <div className="w-96 md:w-1/2 ...">
*/
```

**Classes to review** — inserted after the closing `)` of the return statement, lists generated variants that Screen Adapt couldn't reason about and need manual review:
```tsx
// screen-adapt: review these classes
// sm:grid, md:grid, lg:grid
```

On subsequent runs, both comments are replaced with fresh ones.

---

## How values are generated

Both workflows use the same generation logic, adapted for their respective formats. The base viewport assumed for scaling is 1440px.

**Numeric properties** (`width`, `height`, `padding`, `margin`, `max-width`, `font-size`) are scaled proportionally from the base viewport to the target breakpoint size.

**Structural properties** use predefined templates:
- `grid-cols-{n}` collapses to `grid-cols-1` at the smallest breakpoint, `grid-cols-2` at the next, and restores the original from there up
- `flex-row` switches to `flex-col` at the smallest breakpoint and restores from the next up

**Text size** steps down one size per breakpoint, from largest to smallest (e.g. `text-xl` → `text-lg` → `text-base`).

**Everything else** is copied as-is and flagged for review.

---

## Notes

- The `@screens` block is per-file. Different stylesheets can target different screen sets.
- Variants are never overwritten. Remove existing variants manually before re-scaffolding.
- CSS breakpoints use `em` units so they scale with the user's font size preference.
- The Tailwind workflow only operates on static `className` strings. Dynamically constructed class strings (`clsx`, `cn`, template literals) are not supported.
- To hide an element on a specific screen size in CSS, set `display: none` in that variant block. The PostCSS plugin compiles it to a standard media query and the browser handles the rest.