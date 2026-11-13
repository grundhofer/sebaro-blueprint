#!/usr/bin/env python3
"""Fill the generated blocks of the guide pages and write the machine-readable outputs.

Pages in docs/*.html are hand-written. Shared parts sit between marker comments and are rewritten by this script:

    <!-- guide:og page="x" -->     … <!-- /guide:og -->        canonical, og:* and twitter:card of page x (D96, WEB-09),
                                                               from src/og/head/x.head.html (written by tools/og.mjs)
    <!-- guide:head -->            … <!-- /guide:head -->      fonts, tokens, sprite.css, sebaro.css, guide.css, scripts
    <!-- guide:sprite -->          … <!-- /guide:sprite -->    docs/sebaro/icons/sprite.svg, inlined (works from file://)
    <!-- guide:header page="x" --> … <!-- /guide:header -->    site header; page x gets aria-current
    <!-- guide:footer -->          … <!-- /guide:footer -->    site footer with sync state
    <!-- guide:tile id="novalis" size="48" --> … <!-- /guide:tile -->   brand/inline/tile-<id>[-small].svg
    <!-- guide:kern -->            … <!-- /guide:kern -->      index.html: the 31 core rules from design/KERN.de.md

Markers may nest at any depth: open and close markers are paired with a stack, and markers inside generated output
are filled as well. An unclosed or crossed marker stops the build.

The site has three pages (PAGES). The addresses of the pages that went keep a minimal page each (MOVED): written whole
by this script, it says where the content went and links to the start page; noindex, no script, no foreign request,
no share image. tools/check_site.py lists the same files and checks them as such.

Outputs written besides the pages: the pages of MOVED, docs/rules.json (copy of rules/rules.json), docs/llms.txt, and
src/og/pages.json: the share-image page list (D96 (a), brand/og/pages.schema.json of the export), written from the
pages themselves: per page its file, its <h1> as title and its meta description, nothing else (the pages state no
breadcrumb, reading time or date, so every image takes the start form). tools/og.mjs renders it with the exported
docs/sebaro/brand/og/render.mjs to docs/og/<id>.png and src/og/head/<id>.head.html; this script copies each snippet
into the page's guide:og block, without its meta description (the page writes its own). A page without a snippet
gets a placeholder and the build exits 1 (render first: node tools/og.mjs, then this script again).

    python3 tools/build.py          # rewrite blocks and outputs
    python3 tools/build.py --check  # exit 1 if anything would change (freshness gate)
    python3 tools/build.py docs/daten.html   # only this page (safe while others edit other pages)
Standard library only.
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
SEBARO = DOCS / "sebaro"
RULES = ROOT / "rules" / "rules.json"
KERN_DE = ROOT / "design" / "KERN.de.md"     # the core rules in German, for people (check_budget.py keeps it in step)
REPO_URL = "https://github.com/grundhofer/sebaro-blueprint"
SITE_URL = "https://grundhofer.github.io/sebaro-blueprint/"
OG_SRC = ROOT / "src" / "og"
OG_PAGES = OG_SRC / "pages.json"         # page list for render.mjs, written by outputs()
OG_HEAD = OG_SRC / "head"                # <id>.head.html + head.json, written by tools/og.mjs (never published)
OG_MISSING: list[str] = []               # pages whose snippet is missing (build exits 1)

# file, label, icon (sprite id), one line for llms.txt
PAGES = [
    ("index.html", "Start", "home", "Einstieg: was sebaro ist, die 31 Kernregeln auf Deutsch, die Baupläne und Startvorlagen je Produktart"),
    ("bauteile.html", "Bauteile", "copy", "Alle Komponenten mit Zuständen und Markup"),
    ("daten.html", "Daten", "chart-bar", "Jede Datenart einmal dargestellt: Text, Zahlen, Zeit, Status, Listen, Tabellen, Diagramme, Code …"),
]

# the addresses of the pages that went: file, name, where the content went (one or two sentences), links (a link with
# :// leaves the site and ends in the external-link icon); every page links to the start page
_BLOB = f"{REPO_URL}/blob/main/"
_HOME = ("Zur Startseite", "index.html")
MOVED = [
    ("regeln.html", "Regeln", "Die 31 Kernregeln stehen auf der Startseite. Den ganzen Katalog mit Begründung und "
     "Prüfung jeder Regel findest du in rules/rules.json.",
     [("Die 31 Kernregeln", "index.html#kern"), ("rules/rules.json", _BLOB + "rules/rules.json"), _HOME]),
    ("grundlagen.html", "Grundlagen", "Farben, Schrift, Raum und Form kommen als Tokens aus der sebaro-Kopie in "
     "deinem Projekt. Was du davon im Kopf haben musst, sagen die Kernregeln auf der Startseite.",
     [("Die 31 Kernregeln", "index.html#kern"), _HOME]),
    ("plattformen.html", "Plattformen", "Für jede Produktart gibt es einen Bauplan und eine Startvorlage: Website, "
     "Web-App, Desktop-App und Android-App.",
     [("Baupläne und Vorlagen", "index.html#vorlagen"), _HOME]),
    ("web.html", "Web", "Das Beispiel für eine Website ist ihre Startvorlage, ein kleines fertiges Projekt mit Bauplan.",
     [("Startvorlage für Websites", _BLOB + "templates/website-astro/README.md"), _HOME]),
    ("app.html", "App", "Das Beispiel für eine Handy-App ist die Startvorlage für Android, ein kleines fertiges Projekt "
     "mit Bauplan.",
     [("Startvorlage für Android-Apps", _BLOB + "templates/android-compose/README.md"), _HOME]),
    ("ios.html", "iOS", "Die Startvorlage für iOS ist eingefroren. Sie bleibt, wie sie ist, bis eine iOS-App ansteht.",
     [("Startvorlage für iOS", _BLOB + "templates/ios-swiftui/README.md"), _HOME]),
    ("desktop.html", "Desktop", "Das Beispiel für eine Desktop-App ist ihre Startvorlage, ein kleines fertiges Projekt "
     "mit Bauplan.",
     [("Startvorlage für Desktop-Apps", _BLOB + "templates/desktop-tauri/README.md"), _HOME]),
    ("gedanken.html", "Gedanken", "Was gilt, sagen die Kernregeln auf der Startseite. Was sich wann geändert hat, "
     "steht im Änderungsprotokoll.",
     [("Die 31 Kernregeln", "index.html#kern"), ("Änderungsprotokoll", _BLOB + "CHANGELOG.md"), _HOME]),
    ("ausblick.html", "Ausblick", "Was eine Startvorlage noch nicht kann, steht in ihrer README. Was sich geändert "
     "hat, steht im Änderungsprotokoll.",
     [("Baupläne und Vorlagen", "index.html#vorlagen"), ("Änderungsprotokoll", _BLOB + "CHANGELOG.md"), _HOME]),
]


def esc(s: str) -> str:
    return html.escape(s or "", quote=True)


# Characters the shipped font subsets do not contain: rendering them would pull in a system font (D22, FNT3).
# The sources keep the exact characters; the HTML gets words or icons instead. Key glyphs (⌘ ⇧ ⌥ ⌃ ↩ ⎋ ⌫
# ⇥) are real characters of sebaro Sans/Mono since D68 and stay. Arrows in prose stay icons (ICO-06).
GLYPH_WORDS = {"≥": "ab", "≤": "bis", "Δ": "Delta-", "↗": "U+2197"}
GLYPH_ICONS = {"→": ("arrow-right--16", "zu"), "←": ("arrow-left--16", "links"), "↑": ("arrow-up--16", "hoch"),
               "↓": ("arrow-down--16", "runter")}


def _plain(s: str) -> str:
    out = esc(s)
    for ch, word in GLYPH_WORDS.items():
        out = out.replace(ch, word)
    for ch, (name, label) in GLYPH_ICONS.items():
        out = out.replace(ch, f'<svg class="sb-icon sb-icon--16" role="img" aria-label="{label}" focusable="false">'
                              f'<use href="#{name}"/></svg>')
    return out.replace("Delta- ", "Delta-")


# Machine values inside rule text (D101 (6), (10), TXT-08): the sources keep plain text; the HTML marks a
# file name or path as <code class="sb-file-name"> with <wbr> after - . _ / (it breaks only there, never with a
# hyphen), and a markup fragment or an attribute as <code>, so sb-fit.js never hyphenates them (D102 lane narrow, OVF6).
_FILE_RE = (r"(?<![\w/.-])(?:[\w-]+/)*[\w-]+(?:\.[\w-]+)*\."
            r"(?:py|mjs|js|json|css|html|md|kt|swift|txt|sh|toml|rs|svg|png|webp|woff2|webm)(?![\w/])")
_MARKUP_RE = r"<[a-z][^<>]*>(?:[^<>]*</[a-z]+>)?|[a-z][\w:-]*=(?:\"[^\"]*\"|'[^']*')"
_MACHINE = re.compile(f"(?P<file>{_FILE_RE})|(?P<markup>{_MARKUP_RE})")


def _extension_dot(s: str) -> int:
    """Index of the dot before an extension of one to four letters or digits („.csv“, „.md“), else -1: no break goes
    there, so the extension stays with the last part (the workshop's sbExtensionDot, spec/02 §3.11)."""
    dot = s.rfind(".")
    if dot <= 0:
        return -1
    ext = s[dot + 1:]
    return dot if 1 <= len(ext) <= 4 and all(c.isalnum() for c in ext) else -1


def _file_name(s: str, cls: str = "sb-file-name") -> str:
    out = []
    dot = _extension_dot(s)
    for i, ch in enumerate(s):
        out.append(esc(ch))
        if ch in "-._/" and i < len(s) - 1 and i != dot:
            out.append("<wbr>")
    return f'<code class="{cls}">' + "".join(out) + "</code>"


def text(s: str) -> str:
    """Escape rule text for HTML, mark file names and markup as code, and replace characters the fonts lack."""
    s = s or ""
    out, pos = [], 0
    for m in _MACHINE.finditer(s):
        out.append(_plain(s[pos:m.start()]))
        out.append(_file_name(m.group("file")) if m.group("file") else f"<code>{esc(m.group('markup'))}</code>")
        pos = m.end()
    out.append(_plain(s[pos:]))
    return "".join(out)


def icon(name: str, size: int = 16) -> str:
    return (f'<svg class="sb-icon sb-icon--{size}" aria-hidden="true" focusable="false">'
            f'<use href="#{name}"/></svg>')


def sync_state() -> dict:
    p = DOCS / "GUIDE-SYNC.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}


def rules_data() -> dict:
    return json.loads(RULES.read_text(encoding="utf-8")) if RULES.is_file() else {"areas": [], "rules": []}


# ------------------------------------------------------------------ blocks

def page_id(file: str) -> str:
    return file[:-len(".html")]


class _Lead(HTMLParser):
    """The first <h1> text and the meta description of a page (entities decoded, white space collapsed)."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.h1: list[str] | None = None
        self.done = False
        self.description = ""

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and a.get("name") == "description" and not self.description:
            self.description = a.get("content") or ""
        if tag == "h1" and self.h1 is None:
            self.h1 = []

    def handle_endtag(self, tag):
        if tag == "h1" and self.h1 is not None:
            self.done = True

    def handle_data(self, data):
        if self.h1 is not None and not self.done:
            self.h1.append(data)


def page_lead(path: Path) -> tuple[str, str]:
    p = _Lead()
    p.feed(path.read_text(encoding="utf-8"))
    title = " ".join("".join(p.h1 or []).split())
    return title, " ".join(p.description.split())


def og_pages() -> str:
    """src/og/pages.json: one entry per page, its words taken from the page (D96 (a)). Only the start page is
    og:type website; the others keep the default article. No path, reading time or date: no page states them."""
    site = urlsplit(SITE_URL)
    pages = []
    for file, _label, _icon, _desc in PAGES:
        title, description = page_lead(DOCS / file)
        entry = {"id": page_id(file), "url": site.path + ("" if file == "index.html" else file), "title": title}
        if description:
            entry["description"] = description
        if file == "index.html":
            entry["type"] = "website"
        pages.append(entry)
    doc = {
        "$schema": "../../docs/sebaro/brand/og/pages.schema.json",
        "$comment": "written by tools/build.py from the pages (h1, meta description); do not edit. "
                    "tools/og.mjs renders it with docs/sebaro/brand/og/render.mjs (D96 (a), WEB-09).",
        "site": {"product": "studio", "name": "sebaro Guide", "origin": f"{site.scheme}://{site.netloc}",
                 "lang": "de", "imageBase": site.path + "og/"},
        "pages": pages,
    }
    return json.dumps(doc, ensure_ascii=False, indent=2) + "\n"


def block_og(attrs: dict) -> str:
    pid = attrs.get("page", "")
    snippet = OG_HEAD / f"{pid}.head.html"
    if not snippet.is_file():
        OG_MISSING.append(pid)
        return f"<!-- no share image for {esc(pid)} yet: run node tools/og.mjs, then python3 tools/build.py -->"
    # the page writes its own meta description (the page list took it from there); keep every other tag
    lines = [ln for ln in snippet.read_text(encoding="utf-8").strip().splitlines()
             if not ln.startswith('<meta name="description" ')]
    return "\n".join(lines)


def block_head(_attrs: dict) -> str:
    return "\n".join([
        '<meta name="color-scheme" content="light dark">',
        '<script src="sebaro/js/theme-init.js"></script>',
        '<link rel="stylesheet" href="sebaro/fonts/fonts.css">',
        '<link rel="stylesheet" href="sebaro/tokens.css">',
        # the scopes of the sample products the pages show (tile colours by product id): tokens.css lists no
        # product any more, the export brings the samples' own stylesheet
        '<link rel="stylesheet" href="sebaro/demo/products.css">',
        '<link rel="stylesheet" href="sebaro/icons/sprite.css">',
        '<link rel="stylesheet" href="sebaro/css/sebaro.css">',
        '<link rel="stylesheet" href="assets/vendor/demo.css">',
        '<link rel="stylesheet" href="assets/vendor/pages.css">',
        '<link rel="stylesheet" href="assets/guide.css">',
        # the guide's own files from the product kit (sebaro.product.json, tools/sync_from_design.py)
        '<link rel="icon" href="sebaro-product/web/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="sebaro-product/web/icon.svg" type="image/svg+xml">',
        '<script defer src="sebaro/js/theme-button.js"></script>',
        # D91 Z3a/C4c: the footer choice „Farbton: Kühl · Warm“; W8a: paper is always light (theme-init.js applies a
        # stored tone before first paint)
        '<script defer src="sebaro/js/sb-tone.js"></script>',
        '<script defer src="sebaro/js/sb-print.js"></script>',
        '<script defer src="assets/guide.js"></script>',
        # D100 (3), (5), D101 (1), (9), (11): large text (segments to a select, short steps, facts list, series legend,
        # a hyphen only for an overlong word); deferred after guide.js, so it measures the finished chrome
        '<script defer src="sebaro/js/sb-fit.js"></script>',
    ])


def block_sprite(_attrs: dict) -> str:
    return (SEBARO / "icons" / "sprite.svg").read_text(encoding="utf-8").strip()


def tile_svg(product: str, size: str) -> str:
    suffix = "-small" if size == "32" else ""
    svg = (SEBARO / "brand" / "inline" / f"tile-{product}{suffix}.svg").read_text(encoding="utf-8").strip()
    return svg


def block_tile(attrs: dict) -> str:
    return tile_svg(attrs["id"], attrs.get("size", "48"))


def block_header(attrs: dict) -> str:
    current = attrs.get("page", "")
    links = []
    for file, label, _icon, _desc in PAGES:
        cur = ' aria-current="page"' if file == current else ""
        links.append(f'<a href="{file}"{cur}>{esc(label)}</a>')
    return "\n".join([
        '<a class="sb-skip-link" href="#inhalt">Zum Inhalt</a>',
        '<header class="sb-site-header g-header">',
        '  <a class="sb-lockup" href="index.html">',
        f'    <span class="sb-sign-tile sb-sign-tile--32" aria-hidden="true">{tile_svg("studio", "32")}</span>',
        # D100 (5): at 200 % text on 320 px „Guide“ goes under „sebaro“ instead of pushing the page sideways
        '    <span class="g-header__name"><span class="sb-wordmark">sebaro</span><span class="g-header__suffix">Guide</span></span>',
        '  </a>',
        # NAV-07: DOM order lockup, navigation, language, theme button; the guide is German only, so no language switch
        '  <div class="sb-site-header__links">',
        '    <nav class="sb-site-nav g-nav" aria-label="Hauptmenü">',
        "      " + " ".join(links),
        '    </nav>',
        '  </div>',
        '  <button class="sb-theme-button" type="button" data-sb-theme-button>Hell oder Dunkel</button>',
        '  <span class="sb-visually-hidden" role="status" data-sb-theme-status></span>',
        '</header>',
    ])


def block_footer(_attrs: dict) -> str:
    st = sync_state()
    commit = (st.get("sebaroDesignCommit") or "")[:7]
    contracts = st.get("contracts") or {}
    pages = [f'    <li><a href="{file}">{esc(label)}</a></li>' for file, label, _icon, _desc in PAGES]
    return "\n".join([
        '<footer class="sb-site-footer g-footer">',
        '  <nav class="g-footer__pages" aria-label="Alle Seiten">',
        '  <ul class="sb-site-footer__links">',
        *pages,
        '  </ul>',
        '  </nav>',
        f'  <p>sebaro Guide <a href="{REPO_URL}/blob/main/CHANGELOG.md">Version {esc(rules_data().get("version", "?"))}{icon("external-link--16")}</a> · '
        f'System sebaro, Token-Vertrag {esc(str(contracts.get("tokens", "?")))} · '
        f'aus sebaroDesign <code class="sb-code-inline">{esc(commit)}</code> · '
        # D96 (a), WEB-09: the share images end with the host; the page says it too (no text the page lacks)
        # the host is a name (D101 (10)): it breaks at the line end without a hyphen, here after the slash first
        f'online unter <span translate="no">{esc(SITE_URL.split("://", 1)[1].rstrip("/")).replace("/", "/<wbr>")}</span></p>',
        '  <ul class="sb-site-footer__links">',
        '    <li><a href="rules.json">rules.json</a></li>',
        '    <li><a href="llms.txt">llms.txt</a></li>',
        f'    <li><a href="{REPO_URL}">GitHub{icon("external-link--16")}</a></li>',
        f'    <li><a href="{REPO_URL}/blob/main/AGENTS.md">Für Agenten{icon("external-link--16")}</a></li>',
        '  </ul>',
        # D91 Z3a: websites put „Farbton“ in the footer under „Darstellung“ (sb-tone.js shows the hidden group). The
        # <form> keeps these radios a group of their own: examples on bauteile.html carry name="sb-tone" too.
        '  <section class="sb-site-footer__display" aria-labelledby="g-footer-display-h" data-sb-tone-choice hidden>',
        '    <h2 id="g-footer-display-h">Darstellung</h2>',
        '    <form class="g-footer__tone">',
        '      <fieldset class="sb-segmented"><legend>Farbton</legend>',
        '        <div class="sb-segmented__options">',
        f'          <label class="sb-segmented__option"><input type="radio" name="sb-tone" value="cool" checked>'
        f'<span class="sb-segmented__face">{icon("check--16")}Kühl</span></label>',
        f'          <label class="sb-segmented__option"><input type="radio" name="sb-tone" value="warm">'
        f'<span class="sb-segmented__face">{icon("check--16")}Warm</span></label>',
        '        </div>',
        '      </fieldset>',
        '    </form>',
        '  </section>',
        '  <p class="sb-visually-hidden" role="status" data-sb-tone-status></p>',
        '</footer>',
    ])


# ------------------------------------------------------------------ the core rules (guide:kern)

# TXT-04 (core rule 26): a number and its unit stay on one line; KERN.de.md writes a plain space, the page U+00A0
_UNIT = re.compile(r"(\d) ((?:px|dp|ms|s|%|€)(?!\w))")
_SLUG = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss"})


def _kern_inline(s: str) -> str:
    """One paragraph of KERN.de.md as HTML: `code` as inline code (a file name breaks after - . _ /), a markdown link
    [text](file) as a link to that file on GitHub with the external-link icon (LNK-02), the rest through text()."""
    out, pos = [], 0
    for m in re.finditer(r"`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)", s):
        out.append(text(s[pos:m.start()]))
        code, label, target = m.groups()
        if code is not None:
            out.append(_file_name(code, "sb-code-inline sb-file-name") if re.fullmatch(_FILE_RE, code)
                       else f'<code class="sb-code-inline">{esc(code)}</code>')
        else:
            href = urljoin(f"{REPO_URL}/blob/main/{KERN_DE.parent.relative_to(ROOT).as_posix()}/", target)
            out.append(f'<a href="{esc(href)}">{text(label)}{icon("external-link--16")}</a>')
        pos = m.end()
    out.append(text(s[pos:]))
    return _UNIT.sub(r"\1&nbsp;\2", "".join(out))


def kern_doc() -> tuple[list[str], list[tuple[str, list[dict]]]]:
    """(intro paragraphs, [(section heading, [rule])]) of KERN.de.md; a rule is {"n", "text", "items"}: its number, its
    text with the bracketed references at the end, and the lines of its nested list (rule 30). The # title is left
    out: the page has its own <h1>."""
    intro: list[list[str]] = [[]]
    sections: list[tuple[str, list[dict]]] = []
    rule = None
    for line in KERN_DE.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if line.startswith("# "):
            continue
        if line.startswith("## "):
            sections.append((s[3:], []))
            rule = None
        elif not sections:
            if s:
                intro[-1].append(s)
            elif intro[-1]:
                intro.append([])
        elif m := re.match(r"(\d+)\. (.*)", line):
            rule = {"n": int(m.group(1)), "text": [m.group(2)], "items": []}
            sections[-1][1].append(rule)
        elif not s:
            continue
        elif rule is None:
            raise SystemExit(f"{KERN_DE.relative_to(ROOT)}: text outside a numbered rule: {s!r}")
        elif s.startswith("- "):
            rule["items"].append([s[2:]])
        elif rule["items"]:
            rule["items"][-1].append(s)    # a nested item goes on over several lines
        else:
            rule["text"].append(s)
    return [" ".join(p) for p in intro if p], sections


def block_kern(_attrs: dict) -> str:
    """Every section of KERN.de.md as an h2 with one numbered list that keeps the rule numbers; each rule has the id
    regel-<n>, its bracketed references stand small in mono and are not linked."""
    intro, sections = kern_doc()
    out = [f'<p class="g-kern__intro">{_kern_inline(p)}</p>' for p in intro]
    for title, rules in sections:
        numbers = [r["n"] for r in rules]
        if not rules or numbers != list(range(numbers[0], numbers[0] + len(numbers))):
            raise SystemExit(f"{KERN_DE.relative_to(ROOT)}: section {title!r} has the rules {numbers}, not a run")
        sid = "kern-" + re.sub(r"[^a-z0-9]+", "-", title.lower().translate(_SLUG)).strip("-")
        out += [f'<section class="sb-section g-kern" id="{sid}" aria-labelledby="{sid}-h">',
                f'<h2 class="sb-section__title" id="{sid}-h">{esc(title)}</h2>',
                f'<ol class="g-kern__rules" start="{numbers[0]}">']
        for r in rules:
            body = " ".join(r["text"])
            m = re.fullmatch(r"(.*?)\s*\[([^\]]+)\]", body)
            line = f'<li id="regel-{r["n"]}">{_kern_inline(m.group(1) if m else body)}'
            if m:
                # an id or a date never breaks at its hyphen (sb-id, D80)
                refs = re.sub(r"\b([A-Z]{3}-\d{2}|\d{4}-\d{2}-\d{2})\b", r'<span class="sb-id">\1</span>', esc(m.group(2)))
                line += f' <span class="g-kern__refs">[{refs}]</span>'
            if r["items"]:
                line += "\n<ul>\n" + "\n".join(f"<li>{_kern_inline(' '.join(i))}</li>" for i in r["items"]) + "\n</ul>\n"
            out.append(line + "</li>")
        out += ["</ol>", "</section>"]
    return "\n".join(out)


BLOCKS = {"og": block_og, "head": block_head, "sprite": block_sprite, "header": block_header, "footer": block_footer,
          "tile": block_tile, "kern": block_kern}
# one pattern for open and close markers; pairs are matched with a stack, so markers may nest at any depth
MARKER = re.compile(r'<!-- (?P<close>/)?guide:(?P<name>[a-z-]+)(?P<attrs>(?:\s+[a-z]+="[^"]*")*)\s*-->')
ATTR = re.compile(r'([a-z]+)="([^"]*)"')
MAX_DEPTH = 8


def fill(text: str, depth: int = 0) -> str:
    """Rewrite every outermost marker block; markers inside the generated output are filled too, at any depth. A body
    is always regenerated, never kept."""
    if depth > MAX_DEPTH:
        raise SystemExit(f"guide markers nested deeper than {MAX_DEPTH} levels")
    out, pos, stack = [], 0, []
    for m in MARKER.finditer(text):
        name = m.group("name")
        if not m.group("close"):
            stack.append(m)
            continue
        if not stack or stack[-1].group("name") != name:
            line = text.count("\n", 0, m.start()) + 1
            raise SystemExit(f"line {line}: <!-- /guide:{name} --> without a matching open marker")
        start = stack.pop()
        if stack:
            continue  # inner pair: its outermost block is regenerated as a whole
        if name not in BLOCKS:
            raise SystemExit(f"unknown block guide:{name}")
        attrs_raw = start.group("attrs") or ""
        body = fill(BLOCKS[name](dict(ATTR.findall(attrs_raw))), depth + 1)
        out.append(text[pos:start.start()])
        out.append(f'<!-- guide:{name}{attrs_raw} -->\n{body}\n<!-- /guide:{name} -->')
        pos = m.end()
    if stack:
        line = text.count("\n", 0, stack[-1].start()) + 1
        raise SystemExit(f"line {line}: <!-- guide:{stack[-1].group('name')} --> is never closed")
    out.append(text[pos:])
    return "".join(out)


# ------------------------------------------------------------------ outputs

def moved_page(name: str, sentences: str, links: list[tuple[str, str]]) -> str:
    """The whole page at the address of a page that went (MOVED): one heading, where the content went, the links.
    System stylesheets only, no script, no foreign request; a link that leaves the site gets the external-link icon,
    whose one symbol is inlined (no request for the sprite, works from file://)."""
    items, external = [], False
    for label, href in links:
        leaves = "://" in href
        external |= leaves
        items.append(f'    <li><a href="{esc(href)}">{text(label)}{icon("external-link--16") if leaves else ""}</a></li>')
    sprite = (SEBARO / "icons" / "sprite.svg").read_text(encoding="utf-8")
    symbol = re.search(r'<symbol id="external-link--16".*?</symbol>', sprite, re.S).group(0) if external else ""
    return "\n".join([
        "<!doctype html>",
        '<html lang="de">',
        "<head>",
        "<!-- written by tools/build.py (MOVED): the address of a page that went; do not edit -->",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="robots" content="noindex">',
        f"<title>{esc(name)} · sebaro Guide</title>",
        '<meta name="color-scheme" content="light dark">',
        '<link rel="stylesheet" href="sebaro/fonts/fonts.css">',
        '<link rel="stylesheet" href="sebaro/tokens.css">',
        '<link rel="stylesheet" href="sebaro/icons/sprite.css">',
        '<link rel="stylesheet" href="sebaro/css/sebaro.css">',
        '<link rel="icon" href="sebaro-product/web/favicon.ico" sizes="32x32">',
        '<link rel="icon" href="sebaro-product/web/icon.svg" type="image/svg+xml">',
        "</head>",
        '<body class="sb-page">',
        *([f'<svg xmlns="http://www.w3.org/2000/svg" class="sb-sprite" width="0" height="0" aria-hidden="true" '
           f'focusable="false">{symbol}</svg>'] if symbol else []),
        '<main class="sb-container">',
        '  <section class="sb-section sb-page-lead" aria-labelledby="moved-h">',
        f'    <h1 class="sb-page-lead__title" id="moved-h">{esc(name)}</h1>',
        f'    <p class="sb-page-lead__text">{text(sentences)}</p>',
        "  </section>",
        "  <ul>",
        *items,
        "  </ul>",
        "</main>",
        "</body>",
        "</html>",
        "",
    ])


def llms_txt() -> str:
    lines = ["# sebaro Guide", "",
             "> The design guide of every sebaro app, website, web app and desktop app: the 31 core rules, one "
             "blueprint and starter per product kind, components and data display. German UI language (du).", "",
             f"Machine-readable rules: {SITE_URL}rules.json · Agent entry: {REPO_URL}/blob/main/AGENTS.md", "",
             "## Building a product", "",
             f"- [Core rules]({REPO_URL}/blob/main/design/KERN.md) and [view types]({REPO_URL}/blob/main/design/views.md): "
             "the 31 rules and 21 view types to read before any UI work",
             f"- [Playbooks]({REPO_URL}/blob/main/skills/sebaro/SKILL.md): start a new product or convert an existing "
             "project, as an agent skill",
             f"- [Agent snippet]({REPO_URL}/blob/main/templates/AGENTS-snippet.md): five lines to paste into the "
             "product's AGENTS.md",
             f"- [Starters]({REPO_URL}/blob/main/templates/README.md): website (Astro), web app (Vite), desktop (Tauri), "
             "Android (Compose); each README lists what the starter itself does not do yet",
             f"- [Screen checklist]({REPO_URL}/blob/main/templates/screen-checklist.md): walk it before a screen is done; "
             "record every check in CHECKS.md (TEC-06)",
             f"- [Agent test 2026-10]({REPO_URL}/blob/main/docs/agenten-test-2026-10.md): the rules agents missed most "
             "(TEC-06, TXT-04 U+00A0, EBE-05, BEL-10, NAV-06) and why",
             "", "## Pages", ""]
    for file, label, _icon, desc in PAGES:
        lines.append(f"- [{label}]({SITE_URL}{file}): {desc}")
    lines += ["", "## System files (generated, never edit)", "",
              f"- [tokens.css]({SITE_URL}sebaro/tokens.css): every --sb-* custom property, light and dark",
              f"- [sebaro.css]({SITE_URL}sebaro/css/sebaro.css): reference components (sb-*)",
              f"- [sprite.svg]({SITE_URL}sebaro/icons/sprite.svg): icon sprite",
              f"- [fonts.css]({SITE_URL}sebaro/fonts/fonts.css): self-hosted sebaro Sans + sebaro Mono", ""]
    return "\n".join(lines)


def outputs() -> dict[Path, str]:
    out = {DOCS / file: moved_page(name, sentences, links) for file, name, sentences, links in MOVED}
    if RULES.is_file():
        out[DOCS / "rules.json"] = RULES.read_text(encoding="utf-8")
    out[DOCS / "llms.txt"] = llms_txt()
    out[OG_PAGES] = og_pages()
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("pages", nargs="*", help="only these docs/*.html files (no other outputs); default: everything")
    args = ap.parse_args()
    stale = []
    files = [Path(p).resolve() for p in args.pages] if args.pages else sorted(DOCS.glob("*.html"))
    targets = {p: fill(p.read_text(encoding="utf-8")) for p in files}
    if not args.pages:
        targets.update(outputs())
    for path, new in targets.items():
        old = path.read_text(encoding="utf-8") if path.is_file() else None
        if old != new:
            stale.append(path.relative_to(ROOT).as_posix())
            if not args.check:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(new, encoding="utf-8")
    for pid in sorted(set(OG_MISSING)):
        print(f"error: no share-image snippet src/og/head/{pid}.head.html (render: node tools/og.mjs, then build again)")
    if args.check:
        for s in stale:
            print(f"stale: {s}")
        print(f"build --check: {len(stale)} stale of {len(targets)}")
        return 1 if stale or OG_MISSING else 0
    print(f"build: wrote {len(stale)} of {len(targets)} files")
    return 1 if OG_MISSING else 0


if __name__ == "__main__":
    sys.exit(main())
