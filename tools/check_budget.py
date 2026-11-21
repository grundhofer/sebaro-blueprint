#!/usr/bin/env python3
"""Word budgets of the texts an agent reads, and the homes of the long rule catalogue. Standard library only.

    python3 tools/check_budget.py     # exit 1 on any error

Groups
  SIZE  every budgeted file stays under its budget in words, counted as `wc -w` counts (table BUDGETS; a file takes
        the budget of the first pattern it matches). Reference files (MAINTAINING.md, rules/rules.json, the site)
        have no budget: nobody loads them by default.
  READ  what a product start has to read from this repository (skills/sebaro/SKILL.md, design/KERN.md,
        design/views.md and the largest page of design/platforms/) stays under READING words together
  HOME  every rule of rules/rules.json has exactly one home in rules/home.json and no unknown id is listed there;
        a home "core" names a rule number that design/KERN.md has, a home "view" a type key that design/views.md has
  CORE  every [ID] cited in design/KERN.md exists in rules/rules.json and has the home "core" with the number of
        the rule that cites it
  KERNDE design/KERN.de.md, the German text for people, keeps step with design/KERN.md: the same ten sections with
        the same rules in each, the rules 1 to 31 in order, and per rule the same rule ids in its brackets
  PAGES in design/parts/ and design/platforms/ a core rule is cited as [K<n>] with a number design/KERN.md has, every
        other rule by an id of the catalogue; every rule with the home "component" whose part needs something from
        the author on the web or on Android (finding "usage" or "missing" in rules/home.json) is cited in a page of
        design/parts/
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

# path or glob (relative to the repository root) -> words; the first pattern a file matches counts
BUDGETS = {
    "AGENTS.md": 300,
    "design/KERN.md": 1_350,
    "design/KERN.de.md": 1_400,
    "design/views.md": 750,
    "design/platforms/*.md": 300,
    "design/parts/every-part.md": 450,
    "design/parts/evidence.md": 450,
    "design/parts/shortcuts.md": 450,
    "design/parts/*.md": 350,
    "skills/sebaro/AGENTS-snippet.md": 200,
    "skills/sebaro/SKILL.md": 500,
    "skills/*/*.md": 450,
}
# the mandatory reading of this repository for a product start, in words; the workshop's plan and starter README
# carry the rest of the 4,000 words a start may cost
READING = 2_650
READING_FILES = ("skills/sebaro/SKILL.md", "design/KERN.md", "design/views.md")
READING_LARGEST = "design/platforms/*.md"
HOMES = {"core", "view", "component", "words", "platform-web", "platform-android", "platform-ios",
         "platform-desktop", "check", "extra-evidence", "extra-images", "playbook", "lowered"}
CORE_SECTIONS, CORE_RULES = 10, 31


def words(path):
    """Words of a file as `wc -w` counts them: runs of bytes between ASCII white space (U+00A0 separates nothing)."""
    return len(path.read_bytes().split())


def kern_rules(text):
    """[(heading, [(number, references)])] of a core-rule file: each ## section with its numbered rules and the set
    of rule ids in each rule's brackets (a markdown link [text](target) is not a bracket)."""
    sections = []
    for heading, body in re.findall(r"^## (.+?)\n(.*?)(?=^## |\Z)", text, re.M | re.S):
        rules = []
        for number, rule in re.findall(r"^(\d+)\. (.*?)(?=^\d+\. |\Z)", body, re.M | re.S):
            cited = " ".join(re.findall(r"\[([^\]]*)\](?!\()", rule))
            rules.append((int(number), set(re.findall(r"\b[A-Z]{3}-\d{2}\b", cited))))
        sections.append((heading.strip(), rules))
    return sections


def main():
    errors, notes = [], []

    # SIZE
    seen = set()
    for pattern, budget in BUDGETS.items():
        files = [f for f in sorted(ROOT.glob(pattern)) if f not in seen]
        if not files and "*" not in pattern:
            errors.append(f"SIZE {pattern}: missing")
        over = [f for f in files if words(f) > budget]
        for f in over:
            errors.append(f"SIZE {f.relative_to(ROOT)}: {words(f)} of {budget} words (over budget)")
        if len(files) == 1 and not over:
            notes.append(f"SIZE {files[0].relative_to(ROOT)}: {words(files[0])} of {budget} words")
        elif len(files) > 1:
            notes.append(f"SIZE {pattern}: {len(files)} files, the largest {max(map(words, files))} of {budget} words")
        seen.update(files)

    # READ
    reading = [ROOT / f for f in READING_FILES] + [max(ROOT.glob(READING_LARGEST), key=words, default=None)]
    if None in reading or not all(f.is_file() for f in reading):
        errors.append(f"READ a file of the mandatory reading is missing ({', '.join(READING_FILES)}, {READING_LARGEST})")
    else:
        total = sum(map(words, reading))
        line = (f"READ {' + '.join(f'{f.relative_to(ROOT)} {words(f)}' for f in reading)} = {total} of {READING} words")
        (errors if total > READING else notes).append(line + (" (over budget)" if total > READING else ""))

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

    # PAGES
    cited_in_parts = set()
    for folder in ("design/parts", "design/platforms"):
        for f in sorted((ROOT / folder).glob("*.md")):
            for bracket in re.findall(r"\[([^\]\[]*)\](?!\()", f.read_text(encoding="utf-8")):
                for ref in (r.strip() for r in bracket.split(",")):
                    if re.fullmatch(r"K\d+", ref):
                        if int(ref[1:]) not in core_numbers:
                            errors.append(f"PAGES {f.relative_to(ROOT)} cites {ref}, design/KERN.md has no such rule")
                    elif re.fullmatch(r"[A-Z]{3}-\d{2}", ref):
                        if ref not in home:
                            errors.append(f"PAGES {f.relative_to(ROOT)} cites {ref}, which is not a rule of the catalogue")
                        elif home[ref].get("home") == "core":
                            errors.append(f"PAGES {f.relative_to(ROOT)} cites {ref}: a core rule is cited as "
                                          f"[K{home[ref].get('ref')}]")
                        elif folder == "design/parts":
                            cited_in_parts.add(ref)
    for i, h in home.items():
        if h.get("home") != "component":
            continue
        for platform in ("web", "android"):
            if h.get(platform) not in ("carried", "usage", "missing", "n/a"):
                errors.append(f"PAGES {i}: rules/home.json has no finding for {platform}")
        if {h.get("web"), h.get("android")} & {"usage", "missing"} and i not in cited_in_parts:
            errors.append(f"PAGES {i}: its part needs something from the author, but no page of design/parts/ cites it")

    for line in notes:
        print(line)
    for line in errors:
        print("ERROR " + line)
    print(f"check_budget: {len(errors)} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
