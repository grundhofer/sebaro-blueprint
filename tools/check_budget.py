#!/usr/bin/env python3
"""Size budgets of the texts an agent reads by default, and the homes of the long rule catalogue.
Standard library only.

    python3 tools/check_budget.py     # exit 1 on any error

Groups
  SIZE  every file an agent reads by default, and design/KERN.de.md, stays under its budget in bytes (table BUDGETS).
        A file that does not exist yet is reported and skipped. Reference files (MAINTAINING.md, rules/rules.json,
        the site) have no budget: nobody loads them by default.
  HOME  every rule of rules/rules.json has exactly one home in rules/home.json and no unknown id is listed there;
        a home "core" names a rule number that design/KERN.md has, a home "view" a type key that design/views.md has
  CORE  every [ID] cited in design/KERN.md exists in rules/rules.json and has the home "core" with the number of
        the rule that cites it
  KERNDE design/KERN.de.md, the German text for people, keeps step with design/KERN.md: the same ten sections with
        the same rules in each, the rules 1 to 31 in order, and per rule the same set of references in its brackets
        (rule ids such as AKT-01 and decisions such as D145)
  PARTS every rule with the home "component" whose part needs something from the author on the web or on Android
        (finding "usage" or "missing" in rules/home.json) is cited in design/parts.md, and every [ID] cited there
        is a rule with the home "component"
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
    "design/KERN.de.md": 9_000,
    "design/views.md": 4_500,
    "design/parts.md": 8_000,
    "templates/*/BLUEPRINT.md": 10_000,
    "skills/*/*.md": 5_000,
    "templates/AGENTS-snippet.md": 1_500,
}
HOMES = {"core", "view", "component", "words", "platform-web", "platform-android", "platform-ios",
         "platform-desktop", "check", "extra-evidence", "extra-images", "playbook", "workshop", "lowered"}
CORE_SECTIONS, CORE_RULES = 10, 31


def kern_rules(text):
    """[(heading, [(number, references)])] of a core-rule file: each ## section with its numbered rules and the set
    of rule ids and decisions in each rule's brackets (a markdown link [text](target) is not a bracket)."""
    sections = []
    for heading, body in re.findall(r"^## (.+?)\n(.*?)(?=^## |\Z)", text, re.M | re.S):
        rules = []
        for number, rule in re.findall(r"^(\d+)\. (.*?)(?=^\d+\. |\Z)", body, re.M | re.S):
            cited = " ".join(re.findall(r"\[([^\]]*)\](?!\()", rule))
            rules.append((int(number), set(re.findall(r"\b(?:[A-Z]{3}-\d{2}|D\d+)\b", cited))))
        sections.append((heading.strip(), rules))
    return sections


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

    # KERNDE
    kern_de = ROOT / "design/KERN.de.md"
    if not kern_de.is_file():
        errors.append("KERNDE design/KERN.de.md is missing")
    else:
        en, de = kern_rules(kern), kern_rules(kern_de.read_text(encoding="utf-8"))
        for name, sections in (("design/KERN.md", en), ("design/KERN.de.md", de)):
            if len(sections) != CORE_SECTIONS:
                errors.append(f"KERNDE {name} has {len(sections)} sections, expected {CORE_SECTIONS}")
        numbers = [n for _, rules in de for n, _ in rules]
        if numbers != list(range(1, CORE_RULES + 1)):
            errors.append(f"KERNDE design/KERN.de.md has the rules {numbers}, expected 1 to {CORE_RULES} in order")
        for i, ((en_head, en_rules), (de_head, de_rules)) in enumerate(zip(en, de), 1):
            if [n for n, _ in en_rules] != [n for n, _ in de_rules]:
                errors.append(f"KERNDE section {i} „{de_head}“ has the rules {[n for n, _ in de_rules]}, "
                              f"design/KERN.md's „{en_head}“ {[n for n, _ in en_rules]}")
        en_refs = {n: refs for _, rules in en for n, refs in rules}
        for _, rules in de:
            for n, refs in rules:
                if n in en_refs and refs != en_refs[n]:
                    errors.append(f"KERNDE rule {n} cites {sorted(refs)}, design/KERN.md cites {sorted(en_refs[n])}")

    # PARTS
    parts = (ROOT / "design/parts.md").read_text(encoding="utf-8")
    cited = set(re.findall(r"\b[A-Z]{3}-\d{2}\b", " ".join(re.findall(r"\[([^\]]*)\]", parts))))
    for i, h in home.items():
        if h.get("home") != "component":
            continue
        for platform in ("web", "android"):
            if h.get(platform) not in ("carried", "usage", "missing", "n/a"):
                errors.append(f"PARTS {i}: rules/home.json has no finding for {platform}")
        if {h.get("web"), h.get("android")} & {"usage", "missing"} and i not in cited:
            errors.append(f"PARTS {i}: its part needs something from the author, but design/parts.md does not cite it")
    for i in sorted(cited):
        if home.get(i, {}).get("home") != "component":
            errors.append(f"PARTS design/parts.md cites {i}, which is not a rule with the home component")

    for line in notes:
        print(line)
    for line in errors:
        print("ERROR " + line)
    print(f"check_budget: {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
