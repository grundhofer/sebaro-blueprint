#!/usr/bin/env python3
"""Renames the starter „Musterapp“ into a new product. Python 3.10+, only the standard library.

    python3 tools/rename.py <id> <Name>        e.g.  python3 tools/rename.py notizweise Notizweise

Run it once, in the copied starter, after the build setup is exported (README.md, Starten). It replaces
`musterapp` / `Musterapp` in every own file and file name (package, applicationId, rootProject.name, class names,
app_name, the Room schema folder), sets `id` and `name` in sebaro.product.json, builds the product files again and
removes the starter's, and runs `./gradlew ktlintFormat`: the new package sorts differently among the imports. It never
touches the sebaro copy (sebaro/), the build export (build-logic/, config/, .editorconfig, .github/workflows/) or
build outputs. Left for you: your sign in sebaro.product.json and the two sentences in strings_about.xml.
"""
from __future__ import annotations

import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OLD_ID, OLD_NAME = "musterapp", "Musterapp"
SKIP_DIRS = {".git", ".gradle", ".kotlin", "build", "sebaro", "sebaro-product", "build-logic", "config", "tools",
             "workflows", "node_modules"}
TEXT = {".kt", ".kts", ".xml", ".json", ".md", ".toml", ".properties", ".pro", ".yml", ".txt"}


def own_files() -> list[pathlib.Path]:
    found = []
    for path in ROOT.rglob("*"):
        parts = set(path.relative_to(ROOT).parts[:-1])
        if parts & SKIP_DIRS or path.name in SKIP_DIRS:
            continue
        found.append(path)
    return found


def main(argv: list[str]) -> int:
    if len(argv) != 3 or not re.fullmatch(r"[a-z][a-z0-9]*", argv[1]) or not re.fullmatch(r"[A-Z][A-Za-z0-9]*", argv[2]):
        print(__doc__.split("\n\n")[1])
        print("<id>: lower-case letters and digits; <Name>: one word starting with a capital.")
        return 2
    new_id, new_name = argv[1], argv[2]

    changed = 0
    for path in own_files():
        if path.is_file() and path.suffix in TEXT and path.name != "sebaro.product.json":
            text = path.read_text(encoding="utf-8")
            new = text.replace(OLD_ID, new_id).replace(OLD_NAME, new_name)
            if new != text:
                path.write_text(new, encoding="utf-8")
                changed += 1
    # deepest first, so a folder is renamed after what it holds
    moved = 0
    for path in sorted(own_files(), key=lambda p: len(p.parts), reverse=True):
        if OLD_ID in path.name or OLD_NAME in path.name:
            path.rename(path.with_name(path.name.replace(OLD_ID, new_id).replace(OLD_NAME, new_name)))
            moved += 1

    product = ROOT / "sebaro.product.json"
    data = json.loads(product.read_text(encoding="utf-8"))
    data["id"], data["name"] = new_id, new_name
    product.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for old in (ROOT / "sebaro-product").rglob(f"*{OLD_ID}*"):
        old.unlink()
    subprocess.run([sys.executable, "sebaro/product/product_kit.py", "build", "sebaro.product.json", "--copy", "sebaro",
                    "--out", "sebaro-product"], cwd=ROOT, check=True)
    print(f"rename: {changed} files changed, {moved} names moved, product files built for {new_id}")

    if (ROOT / "build-logic").is_dir():
        subprocess.run(["./gradlew", "-q", "ktlintFormat"], cwd=ROOT, check=True)
        print("rename: ktlintFormat done")
    else:
        print("rename: build-logic/ is missing; export the build setup, then run ./gradlew ktlintFormat")
    print("rename: left for you: your sign in sebaro.product.json (then the kit again) and strings_about.xml")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
