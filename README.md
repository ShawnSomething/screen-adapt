# Screen Adapt

Responsive CSS scaffolding. Write your base CSS — Screen Adapt generates the responsive variants and compiles them to standard media queries at build time.

Two parts:

- **PostCSS plugin** — compiles custom `@screens` syntax to standard `@media` queries. Published to npm as [`screen-adapt`](https://www.npmjs.com/package/screen-adapt).
- **VS Code extension** — scaffolds responsive variants automatically as you write CSS. Published to the VS Code Marketplace as [`ShawnKhoo.screen-adapt`](https://marketplace.visualstudio.com/items?itemName=ShawnKhoo.screen-adapt).

No changes to JSX. No new layout system. No runtime cost.

---

## How it works

You declare which screen sizes your project cares about in an `@screens` block at the top of your CSS file. The extension reads that block and scaffolds responsive variants for each selector you point it at. At build time, the PostCSS plugin compiles the custom at-rules to standard `@media` queries and outputs plain CSS.

The dev never writes a media query by hand.

---

## Repo structure

```
screen-adapt/
  postcss-plugin/     PostCSS plugin — compiles @screens syntax at build time
  vscode-extension/   VS Code extension — scaffolds variants as you write CSS
```

Each package has its own README with setup and usage details.

---

## Quick start

**Install the VS Code extension**

Search for `Screen Adapt` in the VS Code Marketplace, or install directly:

```
ext install ShawnKhoo.screen-adapt
```

The extension will prompt you to install the PostCSS plugin when it activates. You can also install it manually:

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

## Packages

| Package | Version | Links |
|---|---|---|
| `screen-adapt` (PostCSS plugin) | [![npm](https://img.shields.io/npm/v/screen-adapt)](https://www.npmjs.com/package/screen-adapt) | [npm](https://www.npmjs.com/package/screen-adapt) · [README](./postcss-plugin/README.md) |
| `ShawnKhoo.screen-adapt` (VS Code extension) | — | [Marketplace](https://marketplace.visualstudio.com/items?itemName=ShawnKhoo.screen-adapt) · [README](./vscode-extension/screen-adapt/README.md) |

---

## License

MIT
