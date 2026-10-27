# Oliver Maier, Dachgutachter und Spenglermeister

The static site for Oliver Maier in Landshut. Netlify serves `public/` exactly as committed and never builds anything (see `netlify.toml`).

## Change the site

```sh
npm install        # once; installs playwright-core, which is only used for screenshots
$EDITOR content/de/site.json    # landing page copy, request page copy and contact details
$EDITOR content/de/legal.json   # Impressum, Haftung, Datenschutz
npm run build      # writes public/index.html, public/imprint.html and public/gutachten-anfragen.html
npm run serve      # preview on http://127.0.0.1:8080
npm run shots      # screenshots of all pages in every direction into spad/after/
```
Commit `content/` and the generated `public/*.html` files together. Never edit generated HTML by hand.

## Layout

| Path | Purpose |
| --- | --- |
| `content/de/*.json` | All copy. Contact facts live once in `site.json` |
| `build/` | Generator (`build.mjs`, `render.mjs`), local server, screenshot script |
| `public/style/base.css` | Shared reset, tokens, layout and components in `@layer reset, tokens, layout, components, direction` |
| `public/style/direction-{a,b,c}.css` | One design direction each, scoped to `[data-v="x"]` |
| `public/js/site.js` | Direction switcher, mobile menu, reveal effects |

## Gutachten anfragen

The guided request page builds one structured plain text message in the browser. With photos and Web Share support, it opens the system share sheet with the photos and message; otherwise it opens a `mailto:` link and photos must be attached manually. Form data is not uploaded or stored, and the visitor sends the message from their own mail app.

## Design directions

The page offers three directions for review. `?v=a`, `?v=b` or `?v=c` opens one directly. To keep only one, delete the other two `direction-*.css` files, their entries in `directions` and their `hero.media` slots in `site.json`, then run `npm run build`.
