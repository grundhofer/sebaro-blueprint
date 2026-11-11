#!/usr/bin/env python3
"""Size budgets of the texts an agent reads by default, and the homes of the long rule catalogue.
Standard library only.

    python3 tools/check_budget.py     # exit 1 on any error

Groups
  SIZE  every file an agent reads by default stays under its budget in bytes (table BUDGETS). A file that does not
        exist yet is reported and skipped. Reference files (MANUAL.md, rules/rules.json, guide/RULES.md, the site)
        have no budget: nobody loads them by default.
  HOME  every rule of rules/rules.json has exactly one home in rules/home.json and no unknown id is listed there;
        a home "core" names a rule number that design/KERN.md has, a home "view" a type key that design/views.md has
  CORE  every [ID] cited in design/KERN.md exists in rules/rules.json and has the home "core" with the number of
        the rule that cites it
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# path or glob (relative to the repository root) -> bytes
BUDGETS = {
    "AGENTS.md": 6_000,
    "design/KERN.md": 8_000,
    "design/views.md": 4_500,
    "templates/*/BLUEPRINT.md": 10_000,
    "skills/*/SKILL.md": 5_000,
}
HOMES = {"core", "view", "component", "words", "platform-web", "platform-android", "platform-ios",
         "platform-desktop", "check", "extra-evidence", "extra-images", "playbook", "workshop", "lowered"}


def main():
    errors, notes = [], []

    # SIZE
    for pattern, budget in BUDGETS.items():
        files = sorted(ROOT.glob(pattern))
        if not files:
            notes.append(f"SIZE {pattern}: not there yet")
        for f in files:
            size = f.stat().st_size
            line = f"SIZE {f.relative_to(ROOT)}: {size} of {budget} bytes"
            (errors if size > budget else notes).append(line + (" (over budget)" if size > budget else ""))

    # HOME
    rules = [r["id"] for r in json.loads((ROOT / "rules/rules.json").read_text(encoding="utf-8"))["rules"]]
    home = json.loads((ROOT / "rules/home.json").read_text(encoding="utf-8"))["rules"]
    kern = (ROOT / "design/KERN.md").read_text(encoding="utf-8")
    views = (ROOT / "design/views.md").read_text(encoding="utf-8")
    core_numbers = {int(n) for n in re.findall(r"^(\d+)\. ", kern, re.M)}
    view_keys = set(re.findall(r"^\| `([a-z-]+)` \|", views, re.M))
    for i in rules:
        if i not in home:
            errors.append(f"HOME {i}: no home in rules/home.json")
    for i, h in home.items():
        if i not in rules:
            errors.append(f"HOME {i}: not a rule of rules/rules.json")
        elif h.get("home") not in HOMES:
            errors.append(f"HOME {i}: unknown home {h.get('home')!r}")
        elif h["home"] == "core" and h.get("ref") not in core_numbers:
            errors.append(f"HOME {i}: design/KERN.md has no rule {h.get('ref')!r}")
        elif h["home"] == "view" and h.get("ref") not in view_keys:
            errors.append(f"HOME {i}: design/views.md has no type {h.get('ref')!r}")

    # CORE
    for number, body in re.findall(r"^(\d+)\. (.*?)(?=^\d+\. |^## |\Z)", kern, re.M | re.S):
        for i in re.findall(r"\b[A-Z]{3}-\d{2}\b", " ".join(re.findall(r"\[([^\]]*)\]", body))):
            if i not in rules:
                errors.append(f"CORE rule {number} cites {i}, which rules/rules.json does not have")
            elif home.get(i) != {"home": "core", "ref": int(number)}:
                errors.append(f"CORE rule {number} cites {i}, but rules/home.json says {home.get(i)}")

    for line in notes:
        print(line)
    for line in errors:
        print("ERROR " + line)
    print(f"check_budget: {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
