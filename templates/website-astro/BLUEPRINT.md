# Website blueprint

How every sebaro website is built under the hood. The design rules are in
[`design/KERN.md`](../../design/KERN.md). This starter does not follow all of it yet; where they differ, the
blueprint wins (last section).

## Stack

- Astro with static output (`format: 'directory'`), Node 22, npm, lock file committed. TypeScript, checked with
  `astro check`.
- No client framework. A page is HTML and CSS; script only where a part needs it.
- No CSS framework: sebaro's layout parts (`sb-stack`, `sb-cluster`, the grid) space the page.
- One build dependency is set: `purgecss`, for the cut under *Size and speed*. Any further dependency needs the
  owner's OK and one line with the reason in the project's docs.

## Structure

```
src/pages/        one file per address, German and English as sibling trees
src/layouts/      the page frames: head, header, footer
src/components/   parts of the site
src/content/      texts as content collections
src/lib/          logic as plain functions
public/sebaro/    the sebaro copy, never edited
```

## Pages

- Order in `<head>`: `theme-init.js` first and blocking, then `fonts/fonts.css`, `tokens.css`,
  `icons/sprite.css`, `css/sebaro.css`, the site's own CSS.
- `<body class="sb-page">`, the icon sprite inline at its top, a skip link to the main content, one `<h1>`.
- The site's own classes carry one prefix and read only `var(--sb-*)`. No colour literal, no `style` attribute.
- Images go through Astro's `<Image>`, never a raw `<img>`.
- Every page with its own title has its own share image.
- A language link leads to the same page in the other language or is not a link.

## Text and language

Texts live in content collections or one strings module, never inside components. German first; an English tree
only when the pages exist in English.

## Tests

- Playwright against the built site: every page in light and dark at phone and desktop width, with axe
  (WCAG 2.2 AA), no sideways scroll, no console error, no violation of the Content-Security-Policy. Once at 200 %
  zoom at desktop width (core rule 30).
- Logic in `src/lib/` has unit tests with Vitest.
- A build test checks the budgets below on the built pages.

## Quality

`astro check`, ESLint with the Astro plugin, Prettier. All three run in CI.

## Security and privacy

- Content-Security-Policy `default-src 'self'; script-src 'self'; style-src 'self'`, sent as a header where the
  host allows it, else as `<meta>`.
- No request to a third-party server: no font service, no CDN, no analytics script. An exception (a counting
  pixel, a consent tool) is a decided deviation of the product and stands in its privacy text.

## Size and speed

Checked on the built pages, the build fails above the budget:

- CSS per page: 90 KB.
- HTML per page: 100 KB.
- Inline script on the start page: 1.5 KB. Other scripts come from a fixed list.

The copy's stylesheet alone is larger than the CSS budget, whatever its packs. The build cuts it and the icon
sprite to what the pages use, with the two scripts the copy's README gives (*Cut the stylesheet to what the pages
use*: `cut-css.mjs`, `cut-icons.mjs`). The cut file is loaded in place of `tokens.css` and `css/sebaro.css`. The
copy lists what its scripts set at run time, so the site keeps no list of sebaro names of its own.

## Build, release, updates

| Workflow | When | What |
|---|---|---|
| `ci` | every push and pull request | type check, lint, copy check, build, budgets, tests |
| `deploy` | main | the built site to the static host, with a preview address per pull request |

- Dependabot once a week for `npm`, minor and patch grouped, and for `github-actions`. Actions are pinned by
  commit.
- The sebaro copy (profile `website`) is updated with `node public/sebaro/checks/update-copy.mjs`, as one commit
  of its own; `npm run sebaro:verify` checks it. Favicons, manifest and the share-image sign come from the kit in
  the copy (`product/`), from the site's `sebaro.product.json`.

## Before you say done

```sh
npm run check && npm run lint
npm run build && npm test
```

Then look at every changed page in light and dark, on the phone and wide, and say what you could not check.

## Where this starter still differs

- It has no `deploy` workflow: the host is the product's choice. The product adds the workflow and, where its host
  allows it, sends the Content-Security-Policy as a header in place of the `<meta>` tag.
- Its strings module and `src/lib/` are plain JavaScript (`.mjs`), so the build scripts read them with Node alone:
  `astro check` reads their types and does not check them.
- It has no `src/components/` and no `src/content/`: header and footer stand in the one layout, every text in the
  strings module.

Everything else in the starter follows this blueprint.
