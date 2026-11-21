# Site footer

`sb-site-footer`, `sb-site-footer__links`, `sb-site-footer__sender` · web only

The foot of every website page, and of every view of a web app without a window: the copyright line and the links a
site must carry.

## Behaviour

- A line on top sets it apart from the page; the copyright line stands in `text-muted`.
- Links: „Impressum“ and „Datenschutz“ always, „Barrierefreiheit“ when the product has that page.
- „GitHub“ stands there, with the external-link icon, only when the product has a public repository. A product under
  the AGPL always shows it, with the title „Quelltext“.
- „Darstellung“ with „Farbton: Kühl · Warm“ stands in the footer of every website. A web app without a window leaves
  it out: its tone stands in the „Mehr“ menu and in its settings.
- A product website adds the sender line: „<Produkt> ist ein Werkzeug von“ and the small key mark (see sender).
- Print hides the footer's links and „Darstellung“.

## Rules

- „Impressum“ and „Datenschutz“ are never left out; only „GitHub“ depends on the product. [WEB-03]
- A link that leaves the site ends in the external-link icon. [K19, LNK-02]
- The sender is no action and no link.
