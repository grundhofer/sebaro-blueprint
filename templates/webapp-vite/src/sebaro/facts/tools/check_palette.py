#!/usr/bin/env python3
"""Validate a sebaroDesign palette file against the schema and the check matrix.

    python3 tools/check_palette.py palettes/_example.json                 # Markdown report to stdout
    python3 tools/check_palette.py palettes/_example.json --json          # JSON to stdout
    python3 tools/check_palette.py palettes/x.json --report out/x.md      # also write the report
    python3 tools/check_palette.py palettes/x.json --html out/x.html      # self-contained swatch sheet
    python3 tools/check_palette.py palettes/*.json --strict               # warnings count as errors

Exit codes: 0 = no errors (warnings allowed unless --strict), 1 = at least one error (schema,
semantic or matrix) or an unreadable / invalid-JSON palette, 2 = usage error or a schema file
that uses a keyword this checker does not implement (fail loud instead of skipping it).

Nothing is written unless --report or --html is given. Python 3.10+, standard library only.
Normative description: shared/PALETTE-CONTRACT.md. Schema: shared/palette.schema.json, which
this script interprets directly (supported keyword subset: SUPPORTED_KEYWORDS below).
"""
from __future__ import annotations

import argparse
import difflib
import html
import json
import math
import pathlib
import re
import sys
from dataclasses import asdict, dataclass, field
from itertools import combinations
from typing import Any

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import color as C  # noqa: E402

TOOL_VERSION = "3.0.0"   # 3.0.0 (PALETTE-CONTRACT 3.0, D147 (2), sebaro CHECKS.md §123): a palette's sign tiles list no product (signTiles.productMap is gone); major 3 accepts "3.0" alone and has every optional section of 2.1 to 2.7 without a version of its own
SCHEMA_VERSION = "3.0"   # the current contract version: last entry of palette.schema.json properties.schemaVersion.enum
# Versions a palette may declare (schema enum). Major 3 starts with "3.0" alone: the 2.x versions left the enum with
# the change that can fail a passing palette (signTiles.productMap is no key any more), PALETTE-CONTRACT section 15.
SCHEMA_VERSIONS_ACCEPTED = ("3.0",)
# The optional sections that came with a minor version of major 2 (productMap of a palette with productAccents 2.1,
# signTiles 2.2, tiles only 2.3, syntax 2.4, categories, mark, variants and dataviz.classed 2.5, dataviz.maxClasses
# 2.6, signTiles.foot 2.7) belong to 3.0 as a whole: no "needs schemaVersion" check can fire in major 3. The names
# stay for the next minor that adds one.
PRODUCT_MAP_SINCE = "3.0"   # productMap of a palette with productAccents (accent families, D34; contract section 8.1)
SIGN_TILES_SINCE = "3.0"    # signTiles (app-sign tile colours, D50, D51; contract section 8.2)
TILES_ONLY_SINCE = "3.0"    # a palette without productAccents (D54; contract section 8.3)
SYNTAX_SINCE = "3.0"        # syntax (code colours, D67; contract section 8.4)
COLOUR_JOBS_SINCE = "3.0"   # categories, mark, variants and dataviz.classed (D73, D90, D91; sections 8.5-8.7, 9.1)
MAX_CLASSES_SINCE = "3.0"   # dataviz.maxClasses: a palette's own, lower class limits (D92; section 9.1)
SCHEMA_PATH = ROOT / "shared" / "palette.schema.json"
# What changed per major contract version; appended to the schemaVersion error of an older file.
MIGRATION_HINTS = {
    "1.0": ("contract 2.0 adds A5/A5-cvd (core accent vs status), P6 now includes info, new "
            "P6-cvd (product accent vs status under CVD, error) and accent/status fills vs "
            "surface and surface-raised (error) and surface-sunken (warning). Set schemaVersion "
            "to \"2.0\" and re-run the checker (shared/PALETTE-CONTRACT.md section 15)"),
    **{v: ("contract 3.0 (D147): a palette lists no product. Remove signTiles.productMap (a product names its tile "
           "group in its own declaration, shared/PRODUCT-CONTRACT.md), set schemaVersion to \"3.0\" and re-run the "
           "checker; nothing else changed (shared/PALETTE-CONTRACT.md section 15)")
       for v in ("2.0", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7")},
}

# ----------------------------------------------------------------------------- thresholds
TEXT_MIN = 4.5          # WCAG 2.2 SC 1.4.3 AA, normal text
LARGE_MIN = 3.0         # WCAG 2.2 SC 1.4.3 AA, large text
UI_MIN = 3.0            # WCAG 2.2 SC 1.4.11 AA, non-text
TILE_GLYPH_MIN = 3.0    # sign on its tile (D50: logo, WCAG 2.2 SC 1.4.11; the app name is the readable text)
TILE_GROUND_MIN = 2.0   # tile against bg of both modes (D51: the tile stays visible on a dark home screen)
# syntax (contract 2.4 section 8.4): code text, so TEXT_MIN on every surface; kept apart from the plain code colours
# (text, text-muted for comments) and from the colours that carry a job elsewhere (D67: no cobalt, no lime, no status)
SYNTAX_PLAIN = ("text", "text-muted")
SYNTAX_RESERVED = ("accent", "link", "success", "warning", "danger", "info")
SYNTAX_RESERVED_EXTRAS = ("primary-action",)   # checked when the palette declares it in extras
DE_DISTINCT = 0.08      # deltaE OK, normal vision: product accents / categorical dataviz
DE_CVD = 0.04           # deltaE OK after CVD simulation
HUE_SHIFT_WARN = 25.0   # degrees, light <-> dark kinship for accent/status roles
ACHROMATIC_C = 0.03     # below this OKLCH chroma a hue is not meaningful
SEQ_MIN_STEP_L = 0.03   # sequential dataviz: minimum OKLCH L step between neighbours
# categories (contract 2.5 section 8.5, D73, D91 C1b): a dot or glyph next to the word, so UI_MIN on every ground; apart
# from each other, from the colours with a job and from the sign tiles like accents (0.08 / 0.04), from the greys by
# DE_GREY so a muted dot never reads as a grey (disabled, neutral) one. Tiles under CVD are reported only (section 8.5).
CATEGORY_JOBS = ("accent", "link", "success", "warning", "danger", "info")
CATEGORY_JOBS_EXTRAS = ("primary-action",)   # checked when the palette declares it in extras
CATEGORY_GREYS = ("text", "text-muted", "border-strong")
DE_GREY = 0.05
# mark (contract 2.5 section 8.6, D73, D91 C2a): text on the fill; the edge carries the shape on every ground and must
# not look like a link underline or an error line; the fill stays apart from selection and the primary action.
MARK_TEXT = ("text", "text-muted", "link")
MARK_EDGE_APART = ("accent", "link", "danger")
MARK_FILL_APART_EXTRAS = ("primary-action", "hover-fill", "pressed-fill")   # when declared in extras
# classed scales (contract 2.5 section 9.1, D91 G6a, G7a, G10a): the ground counts as class 0
CLASS_MAX = 5           # classes per scale (a legend is read by matching; more classes cannot be matched reliably)
# 2.6: dataviz.maxClasses {"sequential": n, "diverging": n} lowers CLASS_MAX per scale for one palette (n 3..5)
CLASS_GROUND_MIN = 3.0  # first class (each class of a diverging arm) vs every ground: WCAG 1.4.11, a cell is a shape
CLASS_STEP_MIN = 1.6    # WCAG ratio between neighbouring classes (luminance survives every CVD and greyscale print)
CLASS_DE_MIN = 0.10     # deltaE OK between neighbouring classes, normal vision and each CVD (five JNDs)
CLASS_APART = ("accent",)            # the place colour stays unique in charts (today's frame, current bar)
CLASS_APART_EXTRAS = ("primary-action",)
# variants (contract 2.5 section 8.7, D90): the grey roles a variant may replace; extras roles may be replaced too
VARIANT_CORE_ROLES = ("bg", "surface", "surface-raised", "surface-sunken", "text", "text-muted", "text-subtle",
                      "border", "border-strong", "scrim")

# APCA reference levels ("APCA in a Nutshell", Bronze simple mode). Advisory only.
APCA_BODY, APCA_CONTENT, APCA_LARGE, APCA_NONTEXT, APCA_DIVIDER = 75, 60, 45, 30, 15

# ----------------------------------------------------------------------------- roles
SURFACES = ("bg", "surface", "surface-raised", "surface-sunken")
STATUSES = ("success", "warning", "danger", "info")
ACCENT_FAMILY = ("accent", "accent-hover", "accent-pressed", "on-accent", "accent-subtle",
                 "text-on-accent-subtle")
CORE_ROLES = (
    "bg", "surface", "surface-raised", "surface-sunken",
    "text", "text-muted", "text-subtle",
    "border", "border-strong",
    *ACCENT_FAMILY,
    "focus",
    *[r for s in STATUSES for r in (s, f"on-{s}", f"{s}-subtle", f"text-on-{s}-subtle")],
    "selection", "scrim",
    "link", "link-visited",
)
ALPHA_ROLES = ("selection", "scrim")
KINSHIP_WARN_ROLES = ("accent", "accent-hover", "accent-pressed", "link", "focus", *STATUSES)
# Fills vs surfaces (A1, P1, S1; contract 7.1/7.2/7.6). A base fill (accent, each product
# accent, each status) must reach UI_MIN on FILL_ERROR_SURFACES (error) and should on
# FILL_WARN_SURFACES (warning); the STATE_FILLS should reach UI_MIN on FILL_ERROR_SURFACES (warning).
FILL_ERROR_SURFACES = ("bg", "surface", "surface-raised")
FILL_WARN_SURFACES = ("surface-sunken",)
STATE_FILLS = ("accent-hover", "accent-pressed")
CVD_KINDS = C.CVD_KINDS

# role -> background it is displayed against on the swatch sheet
PRIMARY_PAIR = {
    "surface": "bg", "surface-raised": "bg", "surface-sunken": "bg",
    "text": "bg", "text-muted": "bg", "text-subtle": "bg",
    "border": "bg", "border-strong": "bg",
    "accent": "bg", "accent-hover": "bg", "accent-pressed": "bg", "on-accent": "accent",
    "accent-subtle": "bg", "text-on-accent-subtle": "accent-subtle", "focus": "bg",
    "selection": "bg", "scrim": "bg", "link": "bg", "link-visited": "bg",
    **{s: "bg" for s in STATUSES},
    **{f"on-{s}": s for s in STATUSES},
    **{f"{s}-subtle": "bg" for s in STATUSES},
    **{f"text-on-{s}-subtle": f"{s}-subtle" for s in STATUSES},
}


# ============================================================================= schema subset

SUPPORTED_KEYWORDS = frozenset({
    # annotations (ignored)
    "$schema", "$id", "$defs", "$comment", "title", "description", "examples", "default",
    "deprecated",
    # applicators / assertions implemented below
    "$ref", "type", "enum", "const",
    "pattern", "minLength", "maxLength",
    "minimum", "maximum",
    "items", "minItems", "maxItems", "uniqueItems",
    "properties", "required", "additionalProperties", "patternProperties", "propertyNames",
    "minProperties", "maxProperties", "dependentRequired",
})


class UnsupportedSchema(Exception):
    """The schema uses something this checker does not implement."""


def _json_type(v: Any) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "boolean"
    if isinstance(v, int):
        return "integer"
    if isinstance(v, float):
        return "number"
    if isinstance(v, str):
        return "string"
    if isinstance(v, list):
        return "array"
    if isinstance(v, dict):
        return "object"
    return type(v).__name__


def _type_ok(v: Any, t: str) -> bool:
    if t == "object":
        return isinstance(v, dict)
    if t == "array":
        return isinstance(v, list)
    if t == "string":
        return isinstance(v, str)
    if t == "boolean":
        return isinstance(v, bool)
    if t == "null":
        return v is None
    if t == "number":
        return isinstance(v, (int, float)) and not isinstance(v, bool)
    if t == "integer":
        return (isinstance(v, int) and not isinstance(v, bool)) or (
            isinstance(v, float) and v.is_integer())
    raise UnsupportedSchema(f"unknown type {t!r}")


def _json_equal(a: Any, b: Any) -> bool:
    if isinstance(a, bool) or isinstance(b, bool):
        return isinstance(a, bool) and isinstance(b, bool) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a == b
    if type(a) is not type(b):
        return False
    if isinstance(a, list):
        return len(a) == len(b) and all(_json_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(_json_equal(a[k], b[k]) for k in a)
    return a == b


def _resolve_ref(ref: str, root: dict) -> Any:
    if not ref.startswith("#/"):
        raise UnsupportedSchema(f"only local '#/...' $ref is supported, got {ref!r}")
    node: Any = root
    for part in ref[2:].split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        if not isinstance(node, dict) or part not in node:
            raise UnsupportedSchema(f"unresolvable $ref {ref!r}")
        node = node[part]
    return node


def _child(path: str, key: str | int) -> str:
    return f"{path}[{key}]" if isinstance(key, int) else f"{path}.{key}"


def validate_schema(inst: Any, schema: Any, root: dict | None = None, path: str = "$") -> list[str]:
    """Validate `inst` against a JSON-Schema (2020-12) SUBSET. Returns error strings.
    Raises UnsupportedSchema for any keyword outside SUPPORTED_KEYWORDS."""
    if root is None:
        root = schema
    if schema is True:
        return []
    if schema is False:
        return [f"{path}: no value allowed here"]
    if not isinstance(schema, dict):
        raise UnsupportedSchema(f"schema node at {path} is not an object")
    unknown = set(schema) - SUPPORTED_KEYWORDS
    if unknown:
        raise UnsupportedSchema(f"unsupported schema keyword(s) {sorted(unknown)} (at {path})")

    errs: list[str] = []
    if "$ref" in schema:
        errs += validate_schema(inst, _resolve_ref(schema["$ref"], root), root, path)

    if "type" in schema:
        types = schema["type"] if isinstance(schema["type"], list) else [schema["type"]]
        if not any(_type_ok(inst, t) for t in types):
            return errs + [f"{path}: expected {' or '.join(types)}, got {_json_type(inst)}"]
    if "const" in schema and not _json_equal(inst, schema["const"]):
        errs.append(f"{path}: must be {json.dumps(schema['const'])}, got {json.dumps(inst)}")
    if "enum" in schema and not any(_json_equal(inst, e) for e in schema["enum"]):
        errs.append(f"{path}: must be one of {json.dumps(schema['enum'])}, got {json.dumps(inst)}")

    if isinstance(inst, str):
        if "pattern" in schema and not re.search(schema["pattern"], inst):
            errs.append(f"{path}: {inst!r} does not match {schema['pattern']}")
        if "minLength" in schema and len(inst) < schema["minLength"]:
            errs.append(f"{path}: shorter than {schema['minLength']} characters")
        if "maxLength" in schema and len(inst) > schema["maxLength"]:
            errs.append(f"{path}: longer than {schema['maxLength']} characters")

    if _type_ok(inst, "number"):
        if "minimum" in schema and inst < schema["minimum"]:
            errs.append(f"{path}: {inst} < minimum {schema['minimum']}")
        if "maximum" in schema and inst > schema["maximum"]:
            errs.append(f"{path}: {inst} > maximum {schema['maximum']}")

    if isinstance(inst, list):
        if "minItems" in schema and len(inst) < schema["minItems"]:
            errs.append(f"{path}: {len(inst)} items, minimum {schema['minItems']}")
        if "maxItems" in schema and len(inst) > schema["maxItems"]:
            errs.append(f"{path}: {len(inst)} items, maximum {schema['maxItems']}")
        if schema.get("uniqueItems"):
            for i, j in combinations(range(len(inst)), 2):
                if _json_equal(inst[i], inst[j]):
                    errs.append(f"{path}: items {i} and {j} are identical")
        if "items" in schema:
            for i, item in enumerate(inst):
                errs += validate_schema(item, schema["items"], root, _child(path, i))

    if isinstance(inst, dict):
        props = schema.get("properties", {})
        pprops = schema.get("patternProperties", {})
        for req in schema.get("required", []):
            if req not in inst:
                errs.append(f"{path}: missing required property '{req}'")
        if "minProperties" in schema and len(inst) < schema["minProperties"]:
            errs.append(f"{path}: {len(inst)} properties, minimum {schema['minProperties']}")
        if "maxProperties" in schema and len(inst) > schema["maxProperties"]:
            errs.append(f"{path}: {len(inst)} properties, maximum {schema['maxProperties']}")
        for trigger, needed in schema.get("dependentRequired", {}).items():
            if trigger in inst:
                for n in needed:
                    if n not in inst:
                        errs.append(f"{path}: '{trigger}' requires '{n}'")
        for key, val in inst.items():
            if "propertyNames" in schema:
                errs += [e.replace(f"{_child(path, key)}:", f"{path}: property name", 1)
                         for e in validate_schema(key, schema["propertyNames"], root,
                                                  _child(path, key))]
            matched = False
            if key in props:
                matched = True
                errs += validate_schema(val, props[key], root, _child(path, key))
            for pat, sub in pprops.items():
                if re.search(pat, key):
                    matched = True
                    errs += validate_schema(val, sub, root, _child(path, key))
            if not matched and "additionalProperties" in schema:
                ap = schema["additionalProperties"]
                if ap is False:
                    hint = difflib.get_close_matches(key, list(props), n=1)
                    errs.append(f"{path}: unknown property '{key}'"
                                + (f" (did you mean '{hint[0]}'?)" if hint else ""))
                else:
                    errs += validate_schema(val, ap, root, _child(path, key))
    return errs


def load_schema(path: pathlib.Path = SCHEMA_PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


# ============================================================================= results

@dataclass
class Check:
    id: str
    group: str
    mode: str | None
    subject: str
    metric: str
    value: float | None = None
    threshold: float | None = None
    severity: str = "error"           # error | warning | info
    passed: bool | None = None        # None for info rows
    fg: str | None = None
    bg: str | None = None
    apca: float | None = None
    apca_ref: float | None = None
    note: str = ""
    data: dict = field(default_factory=dict)

    @property
    def outcome(self) -> str:
        if self.severity == "info" or self.passed is None:
            return "info"
        if self.passed:
            return "pass"
        return "error" if self.severity == "error" else "warning"


@dataclass
class Finding:
    """Schema / semantic finding (not a colour measurement)."""
    severity: str   # error | warning
    where: str
    message: str


@dataclass
class PaletteResult:
    file: str
    palette: dict | None = None
    findings: list[Finding] = field(default_factory=list)
    checks: list[Check] = field(default_factory=list)
    matrix_ran: bool = False

    def count(self, outcome: str) -> int:
        n = sum(1 for c in self.checks if c.outcome == outcome)
        if outcome in ("error", "warning"):
            n += sum(1 for f in self.findings if f.severity == outcome)
        return n

    @property
    def ok(self) -> bool:
        return self.count("error") == 0


# ============================================================================= semantic validation

def semantic_findings(pal: dict, file_stem: str | None = None) -> list[Finding]:
    out: list[Finding] = []
    meta = pal["meta"]
    if file_stem is not None and meta["slug"] != file_stem:
        out.append(Finding("warning", "$.meta.slug",
                           f"slug '{meta['slug']}' differs from file name '{file_stem}.json'"))
    is_example = meta["slug"].startswith("_")
    if is_example != (meta["status"] == "example"):
        out.append(Finding("warning", "$.meta",
                           "a leading underscore in the slug and status 'example' belong together"))

    if "productAccents" not in pal:      # 2.3: tiles only (D54)
        if "signTiles" not in pal:
            out.append(Finding("error", "$", "needs productAccents, or signTiles (section 8.3)"))
        elif SCHEMA_VERSIONS_ACCEPTED.index(pal["schemaVersion"]) < SCHEMA_VERSIONS_ACCEPTED.index(TILES_ONLY_SINCE):
            out.append(Finding("error", "$.productAccents", f"a palette without productAccents needs \"schemaVersion\": "
                                                            f"\"{TILES_ONLY_SINCE}\" (section 8.3); the file declares "
                                                            f"\"{pal['schemaVersion']}\""))
        if "productMap" in pal:
            out.append(Finding("error", "$.productMap", "productMap maps products to productAccents families; a palette "
                                                        "without productAccents lists no product (section 8.3)"))
    ids = [pa["id"] for pa in accents_of(pal)]
    names = [pa["name"] for pa in accents_of(pal)]
    for label, seq in (("id", ids), ("name", names)):
        dupes = sorted({x for x in seq if seq.count(x) > 1})
        if dupes:
            out.append(Finding("error", "$.productAccents", f"duplicate {label}(s): {dupes}"))
    out += product_map_findings(pal)
    out += sign_tile_findings(pal)
    out += syntax_findings(pal)
    out += colour_job_findings(pal)

    classed = pal["dataviz"].get("classed") is True
    for mode in ("light", "dark"):
        dv = pal["dataviz"][mode]
        if len(dv["diverging"]) % 2 == 0:
            out.append(Finding("error", f"$.dataviz.{mode}.diverging",
                               f"needs an odd number of entries (midpoint), has {len(dv['diverging'])}"))
        for kind in ("sequential", "diverging"):
            if len(dv[kind]) < 5 and not classed:
                out.append(Finding("error", f"$.dataviz.{mode}.{kind}",
                                   f"{len(dv[kind])} entries: fewer than 5 need dataviz.classed (section 9.1)"))
        for kind in ("categorical", "sequential", "diverging"):
            norm = [C.normalize_hex(h) for h in dv[kind]]
            dupes = sorted({h for h in norm if norm.count(h) > 1})
            if dupes:
                out.append(Finding("error", f"$.dataviz.{mode}.{kind}", f"duplicate colours {dupes}"))

    extras = pal.get("extras")
    if extras:
        lk, dk = set(extras["light"]), set(extras["dark"])
        if lk != dk:
            out.append(Finding("error", "$.extras",
                               f"roles must exist in both modes; only light: {sorted(lk - dk)}, "
                               f"only dark: {sorted(dk - lk)}"))
        clash = sorted((lk | dk) & set(CORE_ROLES))
        if clash:
            out.append(Finding("error", "$.extras", f"extras may not redefine core roles: {clash}"))
        desc = extras.get("descriptions", {})
        for r in sorted(lk | dk):
            if r not in desc:
                out.append(Finding("warning", "$.extras.descriptions",
                                   f"extra role '{r}' has no description (agents need one)"))
        for r in sorted(set(desc) - (lk | dk)):
            out.append(Finding("error", "$.extras.descriptions", f"describes unknown role '{r}'"))
        known = set(CORE_ROLES) | lk | dk
        for i, chk in enumerate(extras.get("checks", [])):
            for side in ("fg", "bg"):
                if chk[side] not in known:
                    out.append(Finding("error", f"$.extras.checks[{i}].{side}",
                                       f"unknown role '{chk[side]}'"))
    return out


def accents_of(pal: dict) -> list[dict]:
    """The palette's productAccents ([] for a tiles-only palette, contract 2.3)."""
    return pal.get("productAccents", [])


def _key_ident(key: str) -> str:
    """camelCase of a product key, as build_tokens.py turns it into a Swift case (Kotlin: PascalCase of it)."""
    parts = key.split("-")
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])


def product_map_findings(pal: dict) -> list[Finding]:
    """Contract 2.1, section 8.1: productMap maps product keys to accent families (productAccents ids). The
    schema checks the shapes; this checks what it cannot: the declared version, the targets, a key that is also a
    family id, and keys that collide as platform identifiers."""
    pm = pal.get("productMap")
    if pm is None or "productAccents" not in pal:
        return []
    out: list[Finding] = []
    if SCHEMA_VERSIONS_ACCEPTED.index(pal["schemaVersion"]) < SCHEMA_VERSIONS_ACCEPTED.index(PRODUCT_MAP_SINCE):
        out.append(Finding("error", "$.productMap",
                           f"productMap needs \"schemaVersion\": \"{PRODUCT_MAP_SINCE}\" (accent families, "
                           f"PALETTE-CONTRACT section 8.1); the file declares \"{pal['schemaVersion']}\""))
    families = [pa["id"] for pa in pal["productAccents"]]
    for key, fid in pm.items():
        if fid not in families:
            hint = difflib.get_close_matches(fid, families, n=1)
            out.append(Finding("error", f"$.productMap.{key}",
                               f"maps to '{fid}', which is not a productAccents id"
                               + (f" (did you mean '{hint[0]}'?)" if hint else "")
                               + f"; families: {', '.join(families)}"))
        elif key in families and fid != key:
            out.append(Finding("error", f"$.productMap.{key}",
                               f"'{key}' is also a family id but maps to family '{fid}'; a key that names a family "
                               "must map to that family (rename the family or the product)"))
    seen: dict[str, str] = {}
    for key in pm:
        ident = _key_ident(key)
        if ident in seen:
            out.append(Finding("error", f"$.productMap.{key}",
                               f"product keys '{seen[ident]}' and '{key}' become the same Kotlin/Swift name "
                               f"'{ident}'"))
        else:
            seen[ident] = key
    return out


def sign_tile_findings(pal: dict) -> list[Finding]:
    """Contract section 8.2: the signTiles groups. The schema checks the shapes (3.0: no productMap, a palette lists
    no product); this checks unique ids/names/labels, identifier collisions and the foot's roles."""
    st = pal.get("signTiles")
    if st is None:
        return []
    out: list[Finding] = []
    if SCHEMA_VERSIONS_ACCEPTED.index(pal["schemaVersion"]) < SCHEMA_VERSIONS_ACCEPTED.index(SIGN_TILES_SINCE):
        out.append(Finding("error", "$.signTiles",
                           f"signTiles needs \"schemaVersion\": \"{SIGN_TILES_SINCE}\" (sign tiles, PALETTE-CONTRACT "
                           f"section 8.2); the file declares \"{pal['schemaVersion']}\""))
    foot = st.get("foot")
    if foot:
        roles = dict(pal["modes"]["light"], **pal.get("extras", {}).get("light", {}))
        for k, role in foot.items():
            if role not in roles or len(roles[role]) != 7:
                out.append(Finding("error", f"$.signTiles.foot.{k}", "must reference an opaque light colour role"))
    groups = st["groups"]
    for label in ("id", "name", "label"):
        seq = [g[label] for g in groups]
        dupes = sorted({x for x in seq if seq.count(x) > 1})
        if dupes:
            out.append(Finding("error", "$.signTiles.groups", f"duplicate {label}(s): {dupes}"))
    seen: dict[str, str] = {}
    for g in groups:
        ident = _key_ident(g["id"])
        if ident in seen and seen[ident] != g["id"]:
            out.append(Finding("error", f"$.signTiles.groups.{g['id']}",
                               f"group ids '{seen[ident]}' and '{g['id']}' become the same Kotlin/Swift name '{ident}'"))
        seen.setdefault(ident, g["id"])
    return out


def syntax_findings(pal: dict) -> list[Finding]:
    """Contract 2.4, section 8.4: the syntax roles. The schema checks the shapes; this checks the declared version,
    unique ids/names and identifier collisions."""
    sx = pal.get("syntax")
    if sx is None:
        return []
    out: list[Finding] = []
    if SCHEMA_VERSIONS_ACCEPTED.index(pal["schemaVersion"]) < SCHEMA_VERSIONS_ACCEPTED.index(SYNTAX_SINCE):
        out.append(Finding("error", "$.syntax",
                           f"syntax needs \"schemaVersion\": \"{SYNTAX_SINCE}\" (code colours, PALETTE-CONTRACT "
                           f"section 8.4); the file declares \"{pal['schemaVersion']}\""))
    roles = sx["roles"]
    for label in ("id", "name"):
        seq = [r[label] for r in roles]
        dupes = sorted({x for x in seq if seq.count(x) > 1})
        if dupes:
            out.append(Finding("error", "$.syntax.roles", f"duplicate {label}(s): {dupes}"))
    seen: dict[str, str] = {}
    for r in roles:
        ident = _key_ident(r["id"])
        if ident in seen and seen[ident] != r["id"]:
            out.append(Finding("error", f"$.syntax.roles.{r['id']}",
                               f"role ids '{seen[ident]}' and '{r['id']}' become the same Kotlin/Swift name '{ident}'"))
        seen.setdefault(ident, r["id"])
    return out


def class_limits(pal: dict) -> tuple[int, int]:
    """(sequential, diverging) class limits: CLASS_MAX, or lower per scale with dataviz.maxClasses (2.6)."""
    mc = pal["dataviz"].get("maxClasses", {})
    return min(mc.get("sequential", CLASS_MAX), CLASS_MAX), min(mc.get("diverging", CLASS_MAX), CLASS_MAX)


def _since(pal: dict, version: str) -> bool:
    return SCHEMA_VERSIONS_ACCEPTED.index(pal["schemaVersion"]) >= SCHEMA_VERSIONS_ACCEPTED.index(version)


def colour_job_findings(pal: dict) -> list[Finding]:
    """Contract 2.5, sections 8.5-8.7 and 9.1: categories, mark, variants and dataviz.classed. The schema checks the
    shapes; this checks the declared version, unique tone names and the roles a variant may replace."""
    out: list[Finding] = []
    keys = [k for k in ("categories", "mark", "variants") if k in pal]
    if pal["dataviz"].get("classed") is not None:
        keys.append("dataviz.classed")
    if keys and not _since(pal, COLOUR_JOBS_SINCE):
        for k in keys:
            out.append(Finding("error", f"$.{k}", f"{k} needs \"schemaVersion\": \"{COLOUR_JOBS_SINCE}\" (PALETTE-CONTRACT "
                                                  f"sections 8.5-8.7, 9.1); the file declares \"{pal['schemaVersion']}\""))
    if "maxClasses" in pal["dataviz"]:
        if not _since(pal, MAX_CLASSES_SINCE):
            out.append(Finding("error", "$.dataviz.maxClasses",
                               f"dataviz.maxClasses needs \"schemaVersion\": \"{MAX_CLASSES_SINCE}\" (PALETTE-CONTRACT "
                               f"section 9.1); the file declares \"{pal['schemaVersion']}\""))
        if pal["dataviz"].get("classed") is not True:
            out.append(Finding("error", "$.dataviz.maxClasses", "dataviz.maxClasses needs \"classed\": true "
                                                                "(PALETTE-CONTRACT section 9.1)"))
    if "categories" in pal:
        names = [t["name"] for t in pal["categories"]["tones"]]
        dupes = sorted({x for x in names if names.count(x) > 1})
        if dupes:
            out.append(Finding("error", "$.categories.tones", f"duplicate name(s): {dupes}"))
    extra_roles = set(pal.get("extras", {}).get("light", {}))
    for vid, var in pal.get("variants", {}).items():
        lk, dk = set(var["light"]), set(var["dark"])
        if lk != dk:
            out.append(Finding("error", f"$.variants.{vid}", f"both modes must replace the same roles; only light: "
                                                              f"{sorted(lk - dk)}, only dark: {sorted(dk - lk)}"))
        for mode in ("light", "dark"):
            for r in var[mode]:
                if r in VARIANT_CORE_ROLES or r in extra_roles:
                    if C.has_alpha(var[mode][r]) and r in CORE_ROLES and r not in ALPHA_ROLES:
                        out.append(Finding("error", f"$.variants.{vid}.{mode}.{r}", "alpha is allowed only for scrim and "
                                                                                     "extras roles (section 3)"))
                    continue
                why = ("a core role with a job (accent, status, link, focus, selection, on-*) stays the same in every "
                       "variant" if r in CORE_ROLES else "not a core grey role and not declared in extras")
                out.append(Finding("error", f"$.variants.{vid}.{mode}.{r}", f"a variant may not replace '{r}': {why} "
                                                                             "(section 8.7)"))
    return out


def variant_palette(pal: dict, vid: str) -> dict:
    """The palette with variant `vid` applied: its core roles replace modes.<mode>, its extras roles extras.<mode>."""
    out = json.loads(json.dumps(pal))
    var = pal["variants"][vid]
    for mode in ("light", "dark"):
        for r, v in var[mode].items():
            if r in CORE_ROLES:
                out["modes"][mode][r] = v
            else:
                out["extras"][mode][r] = v
    out.pop("variants", None)
    return out


def families_of(pal: dict) -> dict[str, list[str]]:
    """Family id -> product keys mapped to it, in productMap order (every family listed; spare = []).
    Without a productMap every accent is its own product (contract 2.0 meaning: accent id = product key)."""
    pm = pal.get("productMap")
    if pm is None:
        return {pa["id"]: [pa["id"]] for pa in accents_of(pal)}
    out: dict[str, list[str]] = {pa["id"]: [] for pa in accents_of(pal)}
    for key, fid in pm.items():
        if fid in out:
            out[fid].append(key)
    return out


# ============================================================================= matrix

class Matrix:
    def __init__(self, pal: dict):
        self.pal = pal
        self.checks: list[Check] = []

    # -- helpers -----------------------------------------------------------------
    def roles(self, mode: str) -> dict:
        r = dict(self.pal["modes"][mode])
        r.update(self.pal.get("extras", {}).get(mode, {}))
        return r

    def eff(self, mode: str, name: str, over: str | None = None) -> str:
        """Effective opaque hex of a role; alpha roles are composited over `over` (default bg)."""
        roles = self.roles(mode)
        hx = roles[name]
        if C.has_alpha(hx):
            base = over if over is not None else roles["bg"]
            return C.composite_hex(hx, base)
        return C.normalize_hex(hx)

    def add(self, **kw) -> Check:
        c = Check(**kw)
        self.checks.append(c)
        return c

    def contrast(self, cid: str, group: str, mode: str | None, fg_label: str, bg_label: str,
                 fg: str, bg: str, minimum: float | None, severity: str, apca_ref: float | None,
                 kind: str = "text", note: str = "") -> Check:
        ratio = C.wcag_contrast(fg, bg)
        lc = C.apca_contrast(fg, bg)
        join = "on" if kind == "text" else "vs"
        if minimum is None:
            severity, passed = "info", None
        else:
            passed = ratio >= minimum
        return self.add(id=cid, group=group, mode=mode, subject=f"{fg_label} {join} {bg_label}",
                        metric="wcag", value=ratio, threshold=minimum, severity=severity,
                        passed=passed, fg=fg, bg=bg, apca=lc, apca_ref=apca_ref, note=note,
                        data={"kind": kind, "fgRole": fg_label, "bgRole": bg_label})

    def role_contrast(self, cid, mode, fg_role, bg_role, minimum, severity, apca_ref, kind="text",
                      note="", group=None):
        bg = self.eff(mode, bg_role)
        fg = self.eff(mode, fg_role, over=bg)
        return self.contrast(cid, group or f"core:{mode}", mode, fg_role, bg_role, fg, bg,
                             minimum, severity, apca_ref, kind, note)

    def distinct(self, cid: str, group: str, mode: str, label_a: str, label_b: str, a: str, b: str,
                 kinds: tuple[str, ...], de_min: float | None, cvd_min: float | None,
                 sev_normal: str, sev_cvd: str, data: dict | None = None) -> None:
        extra = data or {}
        if "normal" in kinds:
            d = C.delta_e_ok(a, b)
            self.add(id=cid, group=group, mode=mode, subject=f"{label_a} / {label_b}",
                     metric="deltaE", value=d, threshold=de_min,
                     severity=sev_normal if de_min is not None else "info",
                     passed=(d >= de_min) if de_min is not None else None, fg=a, bg=b,
                     data={"pair": [label_a, label_b], "vision": "normal", **extra})
        for k in kinds:
            if k == "normal":
                continue
            sa, sb = C.simulate_cvd_hex(a, k), C.simulate_cvd_hex(b, k)
            d = C.delta_e_ok(sa, sb)
            self.add(id=cid + "-cvd", group=group, mode=mode,
                     subject=f"{label_a} / {label_b} ({k})", metric=f"deltaE:{k}", value=d,
                     threshold=cvd_min, severity=sev_cvd if cvd_min is not None else "info",
                     passed=(d >= cvd_min) if cvd_min is not None else None, fg=a, bg=b,
                     data={"pair": [label_a, label_b], "vision": k, "simulated": [sa, sb], **extra})

    # -- core roles ------------------------------------------------------------------
    def core(self, mode: str) -> None:
        rules = self.pal["rules"]
        for s in SURFACES:
            self.role_contrast("T1", mode, "text", s, TEXT_MIN, "error", APCA_BODY)
        for s in SURFACES:
            self.role_contrast("T2", mode, "text-muted", s, TEXT_MIN, "error", APCA_CONTENT)
        for s in SURFACES:
            c = self.role_contrast("T3", mode, "text-subtle", s, LARGE_MIN, "error", APCA_LARGE)
            if c.value is not None and c.value < TEXT_MIN:
                c.note = ("below 4.5: large text or WCAG-exempt text only "
                          "(rules.textSubtleNonEssential)")
        for s in ("bg", "surface"):
            self.role_contrast("B1", mode, "border-strong", s, UI_MIN, "error", APCA_NONTEXT, "ui")
        for s in ("surface-raised", "surface-sunken"):
            self.role_contrast("B1", mode, "border-strong", s, UI_MIN, "warning", APCA_NONTEXT, "ui")
        for s in ("bg", "surface"):
            self.role_contrast("B2", mode, "border", s, None, "info", APCA_DIVIDER, "ui",
                               note="decorative; exempt from SC 1.4.11")

        for s in FILL_ERROR_SURFACES:
            self.role_contrast("A1", mode, "accent", s, UI_MIN, "error", APCA_NONTEXT, "ui")
        for s in FILL_WARN_SURFACES:
            self.role_contrast("A1", mode, "accent", s, UI_MIN, "warning", APCA_NONTEXT, "ui")
        for r in STATE_FILLS:
            for s in FILL_ERROR_SURFACES:
                self.role_contrast("A1", mode, r, s, UI_MIN, "warning", APCA_NONTEXT, "ui")
        for r in ("accent", "accent-hover", "accent-pressed"):
            self.role_contrast("A2", mode, "on-accent", r, TEXT_MIN, "error", APCA_CONTENT)
        self.role_contrast("A3", mode, "text-on-accent-subtle", "accent-subtle", TEXT_MIN, "error",
                           APCA_CONTENT)
        self.role_contrast("A4", mode, "accent-subtle", "bg", None, "info", APCA_DIVIDER, "ui",
                           note="tinted fill; never the only state indicator")
        for st in STATUSES:
            self.distinct("A5", f"core:{mode}", mode, "accent", st, self.eff(mode, "accent"),
                          self.eff(mode, st), ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD,
                          "warning", "error")

        for link in ("link", "link-visited"):
            for s in ("bg", "surface"):
                self.role_contrast("L1", mode, link, s, TEXT_MIN, "error", APCA_CONTENT)
            for s in ("surface-raised", "surface-sunken"):
                self.role_contrast("L1", mode, link, s, TEXT_MIN, "warning", APCA_CONTENT)
        for link in ("link", "link-visited"):
            if rules["linkUnderline"] == "always":
                self.role_contrast("L2", mode, link, "text", None, "info", None, "ui",
                                   note="rules.linkUnderline = always: no link/text contrast needed")
            else:
                self.role_contrast("L2", mode, link, "text", UI_MIN, "error", None, "ui",
                                   note="rules.linkUnderline = hover-focus requires >= 3:1 vs text")
        self.distinct("L3", f"core:{mode}", mode, "link", "link-visited",
                      self.eff(mode, "link"), self.eff(mode, "link-visited"), ("normal",),
                      None, None, "info", "info")

        for s in ("bg", "surface"):
            self.role_contrast("F1", mode, "focus", s, UI_MIN, "error", APCA_NONTEXT, "ui")
        for s in ("surface-raised", "surface-sunken"):
            self.role_contrast("F1", mode, "focus", s, UI_MIN, "warning", APCA_NONTEXT, "ui")
        self.role_contrast("F1", mode, "focus", "accent", None, "info", None, "ui",
                           note="ring adjacent to a filled accent control (no offset)")

        for st in STATUSES:
            for s in FILL_ERROR_SURFACES:
                self.role_contrast("S1", mode, st, s, UI_MIN, "error", APCA_NONTEXT, "ui")
            for s in FILL_WARN_SURFACES:
                self.role_contrast("S1", mode, st, s, UI_MIN, "warning", APCA_NONTEXT, "ui")
            self.role_contrast("S2", mode, f"on-{st}", st, TEXT_MIN, "error", APCA_CONTENT)
            self.role_contrast("S3", mode, f"text-on-{st}-subtle", f"{st}-subtle", TEXT_MIN,
                               "error", APCA_CONTENT)
        for a, b in combinations(STATUSES, 2):
            self.distinct("S4", f"core:{mode}", mode, a, b, self.eff(mode, a), self.eff(mode, b),
                          ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "warning", "warning")

        for s in ("bg", "surface"):
            sel = self.eff(mode, "selection", over=self.eff(mode, s))
            self.contrast("X1", f"core:{mode}", mode, "text", f"selection over {s}",
                          self.eff(mode, "text"), sel, TEXT_MIN, "error", APCA_BODY)
        scrimmed = self.eff(mode, "scrim", over=self.eff(mode, "bg"))
        self.contrast("X2", f"core:{mode}", mode, "surface-raised", "scrim over bg",
                      self.eff(mode, "surface-raised"), scrimmed, None, "info", None, "ui",
                      note="dialog against dimmed page")

    # -- product accents ---------------------------------------------------------------
    def product_accents(self) -> None:
        pas = accents_of(self.pal)
        for mode in ("light", "dark"):
            surf = {sf: self.eff(mode, sf) for sf in SURFACES}
            group = f"product:{mode}"
            for pa in pas:
                s = pa[mode]
                pid = pa["id"]
                acc = C.normalize_hex(s["accent"])

                def pc(cid, fg_r, bg_r, fg, bgc, minimum, sev, ref, kind="text"):
                    c = self.contrast(cid, group, mode, f"{pid}.{fg_r}", bg_r, fg, bgc, minimum,
                                      sev, ref, kind)
                    c.data["accentId"] = pid
                    c.data["slot"] = f"{fg_r}|{bg_r}"
                    return c

                for sf in FILL_ERROR_SURFACES:
                    pc("P1", "accent", sf, acc, surf[sf], UI_MIN, "error", APCA_NONTEXT, "ui")
                for sf in FILL_WARN_SURFACES:
                    pc("P1", "accent", sf, acc, surf[sf], UI_MIN, "warning", APCA_NONTEXT, "ui")
                for r in STATE_FILLS:
                    for sf in FILL_ERROR_SURFACES:
                        pc("P1", r, sf, C.normalize_hex(s[r]), surf[sf], UI_MIN, "warning",
                           APCA_NONTEXT, "ui")
                for r in ("accent", "accent-hover", "accent-pressed"):
                    pc("P2", "on-accent", f"{pid}.{r}", C.normalize_hex(s["on-accent"]),
                       C.normalize_hex(s[r]), TEXT_MIN, "error", APCA_CONTENT)
                pc("P3", "text-on-accent-subtle", f"{pid}.accent-subtle",
                   C.normalize_hex(s["text-on-accent-subtle"]), C.normalize_hex(s["accent-subtle"]),
                   TEXT_MIN, "error", APCA_CONTENT)
                for st in ("danger", "success", "warning", "info"):
                    self.distinct("P6", group, mode, f"{pid}.accent", st, acc, self.eff(mode, st),
                                  ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "warning", "error",
                                  data={"accentId": pid})
            for a, b in combinations(pas, 2):
                self.distinct("P4", group, mode, a["id"], b["id"],
                              C.normalize_hex(a[mode]["accent"]), C.normalize_hex(b[mode]["accent"]),
                              ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "error", "error")
        # P5 = kinship of product accents (in kinship())

    # -- sign tiles (contract 2.2, section 8.2) --------------------------------------------
    def sign_tiles(self) -> None:
        st = self.pal.get("signTiles")
        if not st:
            return
        groups = st["groups"]
        foot = st.get("foot")
        if foot:
            band, line = (self.eff("light", foot[k]) for k in ("band", "line"))
            self.contrast("G4", "tiles", None, "foot.band", "foot.line", band, line,
                          3.0, "error", None, "ui", note="fixed foot colours, both modes")
            for g in groups:
                # The two adjacent boundaries are alternatives; the stronger one must survive.
                boundary = max((band, line), key=lambda c: C.wcag_contrast(c, g["tile"]))
                self.contrast("G5", "tiles", None, "foot.boundary", g["id"], boundary, g["tile"],
                              3.0, "error", None, "ui", note="stronger of band/tile and line/tile")
        for g in groups:
            tile, glyph = C.normalize_hex(g["tile"]), C.normalize_hex(g["glyph"])
            c = self.contrast("G1", "tiles", None, f"{g['id']}.glyph", f"{g['id']}.tile", glyph, tile,
                              TILE_GLYPH_MIN, "error", APCA_NONTEXT, "ui",
                              note="sign on its tile; the same pair in both modes")
            c.data["tileGroup"] = g["id"]
            for mode in ("light", "dark"):
                c = self.contrast("G3", "tiles", mode, f"{g['id']}.tile", "bg", tile, self.eff(mode, "bg"),
                                  TILE_GROUND_MIN, "error", None, "ui", note="tile visible on the ground")
                c.data["tileGroup"] = g["id"]
        for a, b in combinations(groups, 2):
            self.distinct("G2", "tiles", None, a["id"], b["id"], C.normalize_hex(a["tile"]),
                          C.normalize_hex(b["tile"]), ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "error", "error")

    def syntax(self) -> None:
        sx = self.pal.get("syntax")
        if not sx:
            return
        roles = sx["roles"]
        for mode in ("light", "dark"):
            group = f"syntax:{mode}"
            rs = self.roles(mode)
            for r in roles:
                fg = C.normalize_hex(r[mode])
                for s in SURFACES:
                    c = self.contrast("Y1", group, mode, f"syntax.{r['id']}", s, fg, self.eff(mode, s), TEXT_MIN,
                                      "error", APCA_CONTENT, note="code text on every ground")
                    c.data["syntaxRole"] = r["id"]
            plain = [(f"syntax.{r['id']}", C.normalize_hex(r[mode])) for r in roles] + \
                    [(p, self.eff(mode, p)) for p in SYNTAX_PLAIN]
            for (la, a), (lb, b) in combinations(plain, 2):
                if la in SYNTAX_PLAIN and lb in SYNTAX_PLAIN:
                    continue
                self.distinct("Y2", group, mode, la, lb, a, b, ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD,
                              "error", "error")
            reserved = list(SYNTAX_RESERVED) + [x for x in SYNTAX_RESERVED_EXTRAS if x in rs]
            for r in roles:
                for x in reserved:
                    self.distinct("Y3", group, mode, f"syntax.{r['id']}", x, C.normalize_hex(r[mode]),
                                  self.eff(mode, x), ("normal",), DE_DISTINCT, None, "error", "error")
        for r in roles:
            self._kin("Y4", f"syntax.{r['id']}", C.normalize_hex(r["light"]), C.normalize_hex(r["dark"]), False)

    # -- categories (contract 2.5, section 8.5) ---------------------------------------
    def categories(self) -> None:
        cs = self.pal.get("categories")
        if not cs:
            return
        tones = cs["tones"]
        tiles = (self.pal.get("signTiles") or {}).get("groups", [])
        for mode in ("light", "dark"):
            group = f"categories:{mode}"
            rs = self.roles(mode)
            hexes = [(f"category-{i}", C.normalize_hex(t[mode])) for i, t in enumerate(tones, 1)]
            for i, (lab, h) in enumerate(hexes, 1):
                for s in SURFACES:
                    c = self.contrast("C1", group, mode, lab, s, h, self.eff(mode, s), UI_MIN, "error", APCA_NONTEXT,
                                      "ui", note="dot or glyph next to the word")
                    c.data["category"] = i
            for (la, a), (lb, b) in combinations(hexes, 2):
                self.distinct("C2", group, mode, la, lb, a, b, ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD,
                              "error", "error")
            jobs = list(CATEGORY_JOBS) + [x for x in CATEGORY_JOBS_EXTRAS if x in rs]
            for lab, h in hexes:
                for j in jobs:
                    self.distinct("C3", group, mode, lab, j, h, self.eff(mode, j), ("normal",) + CVD_KINDS,
                                  DE_DISTINCT, DE_CVD, "error", "error")
                for g in tiles:
                    self.distinct("C4", group, mode, lab, f"tile-{g['id']}", h, C.normalize_hex(g["tile"]),
                                  ("normal",) + CVD_KINDS, DE_DISTINCT, None, "error", "info")
                for gr in CATEGORY_GREYS:
                    self.distinct("C5", group, mode, lab, gr, h, self.eff(mode, gr), ("normal",), DE_GREY, None,
                                  "error", "error")
        for i, t in enumerate(tones, 1):
            self._kin("C6", f"category-{i} ({t['name']})", C.normalize_hex(t["light"]), C.normalize_hex(t["dark"]),
                      False)

    # -- mark (contract 2.5, section 8.6) ------------------------------------------------
    def mark(self) -> None:
        mk = self.pal.get("mark")
        if not mk:
            return
        syn = (self.pal.get("syntax") or {}).get("roles", [])
        for mode in ("light", "dark"):
            group = f"mark:{mode}"
            rs = self.roles(mode)
            fill, edge = C.normalize_hex(mk[mode]["fill"]), C.normalize_hex(mk[mode]["edge"])
            for r in MARK_TEXT:
                self.contrast("M1", group, mode, r, "mark.fill", self.eff(mode, r, over=fill), fill, TEXT_MIN, "error",
                              APCA_CONTENT, note="marked text")
            for r in syn:
                self.contrast("M1", group, mode, f"syntax.{r['id']}", "mark.fill", C.normalize_hex(r[mode]), fill,
                              TEXT_MIN, "error", APCA_CONTENT, note="marked code (search hit in an editor)")
            for s in SURFACES:
                self.contrast("M2", group, mode, "mark.edge", s, edge, self.eff(mode, s), UI_MIN, "error",
                              APCA_NONTEXT, "ui", note="the edge carries the shape")
            for s in ("bg", "surface"):
                sel = self.eff(mode, "selection", over=self.eff(mode, s))
                self.distinct("M3", group, mode, "mark.fill", f"selection over {s}", fill, sel,
                              ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "error", "error")
            for x in MARK_FILL_APART_EXTRAS:
                if x in rs:
                    self.distinct("M3", group, mode, "mark.fill", x, fill, self.eff(mode, x),
                                  ("normal",) + (CVD_KINDS if x == "primary-action" else ()), DE_DISTINCT, DE_CVD,
                                  "error", "error")
            for x in MARK_EDGE_APART:
                self.distinct("M4", group, mode, "mark.edge", x, edge, self.eff(mode, x), ("normal",), DE_DISTINCT,
                              None, "error", "error")
            self.contrast("M5", group, mode, "mark.fill", "bg", fill, self.eff(mode, "bg"), None, "info", None, "ui",
                          note="the fill alone is not the shape")
            self.contrast("M5", group, mode, "mark.edge", "mark.fill", edge, fill, None, "info", None, "ui")

    # -- classed scales (contract 2.5, section 9.1) ------------------------------------------
    def _class_steps(self, cid: str, group: str, mode: str, labels: list[str], steps: list[str]) -> None:
        """Neighbours along one arm (labels[0]/steps[0] is the inner end): WCAG ratio and deltaE, normal and CVD."""
        for (la, a), (lb, b) in zip(zip(labels, steps), list(zip(labels, steps))[1:]):
            self.contrast(cid, group, mode, lb, la, b, a, CLASS_STEP_MIN, "error", None, "ui",
                          note="neighbouring classes")
            self.distinct(cid, group, mode, la, lb, a, b, ("normal",) + CVD_KINDS, CLASS_DE_MIN, CLASS_DE_MIN,
                          "error", "error")

    def classed(self, mode: str, group: str) -> None:
        dv = self.pal["dataviz"][mode]
        seq_max, div_max = class_limits(self.pal)
        rs = self.roles(mode)
        grounds = [(s, self.eff(mode, s)) for s in SURFACES]
        apart = list(CLASS_APART) + [x for x in CLASS_APART_EXTRAS if x in rs]
        bg = self.eff(mode, "bg")
        # sequential: the ground is class 0
        seq = [C.normalize_hex(h) for h in dv["sequential"]]
        lab = [f"sequential[{i}]" for i in range(len(seq))]
        self.add(id="D5", group=group, mode=mode, subject=f"sequential classes ({len(seq)})", metric="count",
                 value=len(seq), threshold=seq_max, severity="error", passed=len(seq) <= seq_max,
                 note=f"at most {seq_max} classes" + (" (dataviz.maxClasses)" if seq_max != CLASS_MAX else ""))
        for s, g in grounds:
            self.contrast("D5", group, mode, lab[0], s, seq[0], g, CLASS_GROUND_MIN, "error", APCA_NONTEXT, "ui",
                          note="first class vs the ground (class 0)")
        self._class_steps("D5", group, mode, lab, seq)
        ratios = [C.wcag_contrast(h, bg) for h in seq]
        self.add(id="D5", group=group, mode=mode, subject="sequential: more is farther from the ground",
                 metric="monotonic", severity="error", passed=all(b > a for a, b in zip(ratios, ratios[1:])),
                 note="vs bg: " + " ".join(C.format_ratio(r) for r in ratios))
        for i, h in enumerate(seq):
            for x in apart:
                self.distinct("D5", group, mode, lab[i], x, h, self.eff(mode, x), ("normal",), DE_DISTINCT, None,
                              "error", "error")
        # diverging: midpoint neutral, both arms classed outwards
        div = [C.normalize_hex(h) for h in dv["diverging"]]
        if len(div) % 2 == 0:
            return
        mid = len(div) // 2
        dl = [f"diverging[{i}]" for i in range(len(div))]
        self.add(id="D6", group=group, mode=mode, subject=f"diverging classes ({len(div)})", metric="count",
                 value=len(div), threshold=div_max, severity="error", passed=len(div) <= div_max,
                 note=f"at most {div_max} classes, the midpoint included"
                      + (" (dataviz.maxClasses)" if div_max != CLASS_MAX else ""))
        cm = C.to_oklch(div[mid])[1]
        self.add(id="D6", group=group, mode=mode, subject="diverging midpoint is neutral", metric="chroma", value=cm,
                 severity="error", passed=cm < ACHROMATIC_C, note="OKLCH C < 0.03")
        for s, g in grounds:
            self.contrast("D6", group, mode, dl[mid], s, div[mid], g, None, "info", None, "ui",
                          note="the midpoint may sit close to the ground")
        arms = (list(range(mid - 1, -1, -1)), list(range(mid + 1, len(div))))
        for arm in arms:
            for k in arm:
                for s, g in grounds:
                    self.contrast("D6", group, mode, dl[k], s, div[k], g, CLASS_GROUND_MIN, "error", APCA_NONTEXT,
                                  "ui", note="every class of an arm vs the ground")
                for x in apart:
                    self.distinct("D6", group, mode, dl[k], x, div[k], self.eff(mode, x), ("normal",), DE_DISTINCT,
                                  None, "error", "error")
            self._class_steps("D6", group, mode, [dl[mid]] + [dl[k] for k in arm], [div[mid]] + [div[k] for k in arm])
            r = [C.wcag_contrast(div[k], bg) for k in arm]
            self.add(id="D6", group=group, mode=mode, subject=f"diverging arm {dl[arm[0]]}..{dl[arm[-1]]}: farther "
                     "from the midpoint is farther from the ground", metric="monotonic", severity="error",
                     passed=all(b > a for a, b in zip(r, r[1:])), note="vs bg: " + " ".join(C.format_ratio(x) for x in r))
        for a, b in zip(*arms):
            self.distinct("D6", group, mode, dl[a], dl[b], div[a], div[b], ("normal",) + CVD_KINDS, CLASS_DE_MIN,
                          CLASS_DE_MIN, "error", "error")

    # -- dataviz -------------------------------------------------------------------
    def dataviz(self) -> None:
        for mode in ("light", "dark"):
            dv = self.pal["dataviz"][mode]
            group = f"dataviz:{mode}"
            bg, surface = self.eff(mode, "bg"), self.eff(mode, "surface")
            cat = [C.normalize_hex(h) for h in dv["categorical"]]
            for i, h in enumerate(cat):
                self.contrast("D1", group, mode, f"categorical[{i}]", "bg", h, bg, UI_MIN, "error",
                              APCA_NONTEXT, "ui")
                self.contrast("D1", group, mode, f"categorical[{i}]", "surface", h, surface, UI_MIN,
                              "warning", APCA_NONTEXT, "ui")
            for i, j in combinations(range(len(cat)), 2):
                self.distinct("D2", group, mode, f"categorical[{i}]", f"categorical[{j}]", cat[i],
                              cat[j], ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "error", "warning")

            seq = [C.normalize_hex(h) for h in dv["sequential"]]
            Ls = [C.to_oklch(h)[0] for h in seq]
            diffs = [b - a for a, b in zip(Ls, Ls[1:])]
            mono = all(d > 0 for d in diffs) or all(d < 0 for d in diffs)
            self.add(id="D3", group=group, mode=mode, subject="sequential lightness is monotonic",
                     metric="monotonic", value=None, severity="error", passed=mono,
                     note="L: " + " ".join(f"{x:.3f}" for x in Ls))
            min_step = min(abs(d) for d in diffs) if diffs else 0.0
            self.add(id="D3", group=group, mode=mode, subject="sequential min lightness step",
                     metric="deltaL", value=min_step, threshold=SEQ_MIN_STEP_L, severity="warning",
                     passed=min_step >= SEQ_MIN_STEP_L)
            far = max(seq, key=lambda h: C.wcag_contrast(h, bg))
            self.contrast("D3", group, mode, "sequential (strongest end)", "bg", far, bg, UI_MIN,
                          "warning", APCA_NONTEXT, "ui")

            div = [C.normalize_hex(h) for h in dv["diverging"]]
            if len(div) % 2 == 1:
                mid = len(div) // 2
                Lm = C.to_oklch(div[mid])[0]
                arms_ok = True
                for arm in (list(range(mid - 1, -1, -1)), list(range(mid + 1, len(div)))):
                    dist = [abs(C.to_oklch(div[k])[0] - Lm) for k in arm]
                    arms_ok &= all(b > a for a, b in zip(dist, dist[1:])) and (not dist or dist[0] > 0)
                self.add(id="D4", group=group, mode=mode,
                         subject="diverging arms move away from the midpoint in lightness",
                         metric="monotonic", severity="warning", passed=arms_ok,
                         note="L: " + " ".join(f"{C.to_oklch(h)[0]:.3f}" for h in div))
                self.distinct("D4", group, mode, "diverging[first]", "diverging[last]", div[0],
                              div[-1], ("normal",) + CVD_KINDS, DE_DISTINCT, DE_CVD, "error", "warning")
            if self.pal["dataviz"].get("classed") is True:
                self.classed(mode, group)

    # -- extras / scales ------------------------------------------------------------
    def extras(self) -> None:
        ex = self.pal.get("extras")
        if not ex:
            return
        for mode in ("light", "dark"):
            for chk in ex.get("checks", []):
                bg = self.eff(mode, chk["bg"])
                fg = self.eff(mode, chk["fg"], over=bg)
                label = chk.get("label", "")
                self.contrast("E1", f"extras:{mode}", mode, chk["fg"], chk["bg"], fg, bg,
                              float(chk["min"]), chk.get("severity", "error"), None,
                              "text" if chk["min"] >= TEXT_MIN else "ui", note=label)

    def scales(self) -> None:
        for name, sc in self.pal.get("scales", {}).items():
            for mode in ("light", "dark"):
                steps = sc.get(mode)
                if not steps:
                    continue
                keys = sorted(steps, key=int)
                Ls = [C.to_oklch(steps[k])[0] for k in keys]
                diffs = [b - a for a, b in zip(Ls, Ls[1:])]
                mono = all(d > 0 for d in diffs) or all(d < 0 for d in diffs)
                self.add(id="SC1", group=f"scales:{mode}", mode=mode,
                         subject=f"scale '{name}' lightness monotonic over steps", metric="monotonic",
                         severity="warning", passed=mono,
                         note=" ".join(f"{k}:{x:.3f}" for k, x in zip(keys, Ls)))

    # -- kinship -------------------------------------------------------------------
    def _kin(self, cid: str, label: str, light_hex: str, dark_hex: str, warn: bool) -> None:
        Ll, Cl, Hl = C.to_oklch(light_hex)
        Ld, Cd, Hd = C.to_oklch(dark_hex)
        data = {"light": {"hex": light_hex, "L": Ll, "C": Cl, "H": Hl},
                "dark": {"hex": dark_hex, "L": Ld, "C": Cd, "H": Hd},
                "dL": Ld - Ll, "dC": Cd - Cl, "dH": None}
        chrom_l, chrom_d = Cl >= ACHROMATIC_C, Cd >= ACHROMATIC_C
        if chrom_l and chrom_d:
            dh = C.hue_difference(Hl, Hd)
            data["dH"] = dh
            if warn:
                self.add(id=cid, group="kinship", mode=None, subject=label, metric="hueShift",
                         value=dh, threshold=HUE_SHIFT_WARN, severity="warning",
                         passed=dh <= HUE_SHIFT_WARN, fg=light_hex, bg=dark_hex, data=data,
                         note="threshold: <= 25 deg (lower is better)")
            else:
                self.add(id=cid, group="kinship", mode=None, subject=label, metric="hueShift",
                         value=dh, severity="info", fg=light_hex, bg=dark_hex, data=data)
        elif warn and chrom_l != chrom_d:
            self.add(id=cid, group="kinship", mode=None, subject=label, metric="hueShift",
                     value=None, threshold=HUE_SHIFT_WARN, severity="warning", passed=False,
                     fg=light_hex, bg=dark_hex, data=data,
                     note="chromatic in one mode, achromatic (C < 0.03) in the other")
        else:
            self.add(id=cid, group="kinship", mode=None, subject=label, metric="hueShift",
                     value=None, severity="info", fg=light_hex, bg=dark_hex, data=data,
                     note="achromatic (C < 0.03): hue not meaningful")

    def kinship(self) -> None:
        for role in CORE_ROLES:
            if role in ALPHA_ROLES:
                continue
            self._kin("K1", role, self.eff("light", role), self.eff("dark", role),
                      role in KINSHIP_WARN_ROLES)
        for pa in accents_of(self.pal):
            self._kin("P5", f"{pa['id']}.accent", C.normalize_hex(pa["light"]["accent"]),
                      C.normalize_hex(pa["dark"]["accent"]), True)

    def run(self) -> list[Check]:
        for mode in ("light", "dark"):
            self.core(mode)
        self.product_accents()
        self.sign_tiles()
        self.syntax()
        self.categories()
        self.mark()
        self.dataviz()
        self.extras()
        self.scales()
        self.kinship()
        return self.checks


# ============================================================================= driver

def check_palette_data(pal: Any, schema: dict, file_label: str = "<memory>",
                       file_stem: str | None = None) -> PaletteResult:
    res = PaletteResult(file=file_label, palette=pal if isinstance(pal, dict) else None)
    errs = validate_schema(pal, schema)
    res.findings += [Finding("error", e.split(":", 1)[0], e.split(":", 1)[1].strip()) for e in errs]
    old = pal.get("schemaVersion") if isinstance(pal, dict) else None
    for f in res.findings:
        if f.where == "$.schemaVersion" and old in MIGRATION_HINTS:
            f.message += f"; {MIGRATION_HINTS[old]}"
    if errs:
        return res
    res.findings += semantic_findings(pal, file_stem)
    if any(f.severity == "error" for f in res.findings):
        return res
    res.checks = Matrix(pal).run()
    for vid in pal.get("variants", {}):   # contract 2.5 section 8.7: every mode-dependent check again per variant
        for c in Matrix(variant_palette(pal, vid)).run():
            if c.mode is None:
                continue
            c.group = f"variant:{vid}:{c.group}"
            c.data["variant"] = vid
            res.checks.append(c)
    res.matrix_ran = True
    return res


def check_palette_file(path: pathlib.Path, schema: dict) -> PaletteResult:
    label = str(path)
    try:
        label = str(path.resolve().relative_to(ROOT))
    except ValueError:
        pass
    try:
        pal = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        r = PaletteResult(file=label)
        r.findings.append(Finding("error", "$", "file not found"))
        return r
    except json.JSONDecodeError as exc:
        r = PaletteResult(file=label)
        r.findings.append(Finding("error", "$", f"invalid JSON: {exc}"))
        return r
    return check_palette_data(pal, schema, label, path.stem)


# ============================================================================= Markdown report

def _md(s: Any) -> str:
    return str(s).replace("|", "\\|").replace("\n", " ")


def _trunc3(x: float) -> str:
    """deltaE / deltaL display: truncated (not rounded) to 3 decimals, like C.format_ratio for
    WCAG ratios (D20), so a failing 0.0396 shows as 0.039 and never as a passing-looking 0.040."""
    return f"{math.floor(x * 1000 + 1e-9) / 1000:.3f}"


def _val(c: Check) -> str:
    if c.value is None:
        return "—"
    if c.metric == "wcag":
        return C.format_ratio(c.value)
    if c.metric == "hueShift":
        return f"{c.value:.1f}°"
    if c.metric == "count":
        return str(int(c.value))
    return _trunc3(c.value)


def _thr(c: Check) -> str:
    if c.threshold is None:
        return "—"
    if c.metric == "hueShift":
        return f"≤ {c.threshold:g}°"
    if c.metric == "count":
        return f"≤ {c.threshold:g}"
    return f"≥ {c.threshold:g}"


def _apca(c: Check) -> str:
    if c.apca is None:
        return "—"
    s = f"{c.apca:+.1f}"
    if c.apca_ref is not None and abs(c.apca) < c.apca_ref:
        s += f" (< {c.apca_ref})"
    return s


_OUT = {"pass": "pass", "error": "**FAIL**", "warning": "warn", "info": "info"}


def _check_table(rows: list[Check]) -> list[str]:
    out = ["| ID | Check | FG | BG | Value | Min | APCA Lc | Result | Note |",
           "|---|---|---|---|---|---|---|---|---|"]
    for c in rows:
        fg = f"`{c.fg}`" if c.fg else "—"
        bg = f"`{c.bg}`" if c.bg else "—"
        out.append(f"| {c.id} | {_md(c.subject)} | {fg} | {bg} | {_val(c)} | "
                   f"{_thr(c)} | {_apca(c)} | {_OUT[c.outcome]} | {_md(c.note)} |")
    return out


def render_markdown(res: PaletteResult) -> str:
    pal = res.palette or {}
    meta = pal.get("meta", {}) if isinstance(pal, dict) else {}
    L: list[str] = []
    title = meta.get("name") or res.file
    L.append(f"# Palette check: {_md(title)}" + (f" (`{meta['slug']}`)" if meta.get("slug") else ""))
    L.append("")
    L.append(f"- File: `{res.file}`")
    if meta:
        L.append(f"- Status: {meta.get('status')} · author: {_md(meta.get('author', ''))} · "
                 f"date: {meta.get('date')}")
    L.append(f"- Checker {TOOL_VERSION} · schema {pal.get('schemaVersion', '?') if isinstance(pal, dict) else '?'}"
             f" · {C.APCA_VERSION} · contract: shared/PALETTE-CONTRACT.md")
    verdict = "PASS" if res.ok else "FAIL"
    L.append("")
    L.append(f"**Verdict: {verdict}**: {res.count('error')} error(s), {res.count('warning')} "
             f"warning(s), {res.count('pass')} passed, {res.count('info')} info rows.")
    if not res.matrix_ran:
        L.append("")
        L.append("The check matrix did NOT run because schema or semantic validation failed. "
                 "Fix the findings below first.")
    L.append("")

    errs = [f for f in res.findings if f.severity == "error"] + [c for c in res.checks
                                                                  if c.outcome == "error"]
    warns = [f for f in res.findings if f.severity == "warning"] + [c for c in res.checks
                                                                     if c.outcome == "warning"]
    for head, items in (("Errors", errs), ("Warnings", warns)):
        L.append(f"## {head}")
        L.append("")
        if not items:
            L.append("None.")
        for it in items:
            if isinstance(it, Finding):
                L.append(f"- `{it.where}`: {_md(it.message)}")
            else:
                mode = f"[{it.mode}] " if it.mode else ""
                if it.data.get("variant"):
                    mode = f"[{it.data['variant']} {it.mode}] "
                L.append(f"- {it.id} {mode}{_md(it.subject)}: {_val(it)} (min {_thr(it)})"
                         + (f"; {_md(it.note)}" if it.note else ""))
        L.append("")

    if not res.matrix_ran:
        return "\n".join(L)

    by = lambda g: [c for c in res.checks if c.group == g]
    for i, mode in enumerate(("light", "dark"), 1):
        L.append(f"## {i}. Core roles: {mode}")
        L.append("")
        L += _check_table([c for c in by(f"core:{mode}") if c.metric == "wcag" or c.id == "L3"])
        L.append("")
        dist = [c for c in by(f"core:{mode}") if c.id.startswith("A5")]
        if dist:
            L.append("Accent vs status (A5, deltaE OK: >= 0.08 normal vision is a warning, "
                     ">= 0.04 under CVD is an error, because the accent carries no icon or word):")
            L.append("")
            L += _distinct_summary(dist)
            L.append("")
        dist = [c for c in by(f"core:{mode}") if c.id.startswith("S4")]
        if dist:
            L.append("Status distinctness (S4, deltaE OK: >= 0.08 normal, >= 0.04 under CVD; "
                     "warnings only, because status never relies on colour alone):")
            L.append("")
            L += _distinct_summary(dist)
            L.append("")

    L.append("## 3. Product accents")
    L.append("")
    pas = accents_of(pal)
    if not pas:
        L.append("None (contract section 8.3): the palette has no product accents; it lists no product, a product "
                 "names its tile group itself (section 3a).")
        L.append("")
    if "productMap" in pal:
        fams = families_of(pal)
        L.append(f"Accent families (`productMap`, contract {PRODUCT_MAP_SINCE} section 8.1): every row below is a "
                 f"family; {len(pal['productMap'])} product(s) share {sum(1 for v in fams.values() if v)} of the "
                 f"{len(fams)} families. The checks run per family, so P4 compares families only.")
        L.append("")
        L.append("| Family | Products | Count |")
        L.append("|---|---|---|")
        for pa in pas:
            keys = fams[pa["id"]]
            L.append(f"| {_md(pa['name'])} (`{pa['id']}`) | "
                     + (", ".join(f"`{k}`" for k in keys) if keys else "— (spare)") + f" | {len(keys)} |")
        L.append("")
    for mode in (("light", "dark") if pas else ()):
        rows = by(f"product:{mode}")
        L.append(f"### {mode}")
        L.append("")
        L.append("| Accent | accent | accent/bg | accent/surface | accent/raised | accent/sunken | "
                 "on/accent | on/hover | on/pressed | subtle text | min ΔE to status | "
                 "min ΔE to status (CVD) | Result |")
        L.append("|---|---|---|---|---|---|---|---|---|---|---|---|---|")
        for pa in pas:
            pid = pa["id"]
            mine = [c for c in rows if c.data.get("accentId") == pid]
            slot = {c.data.get("slot"): c for c in mine if c.metric == "wcag"}
            g = lambda k: (C.format_ratio(slot[k].value) + ("" if slot[k].outcome in ("pass", "info")
                                                             else " ✗")) if k in slot else "—"

            def worst_txt(fam: str) -> str:
                stat = [c for c in mine if c.id == fam]
                if not stat:
                    return "—"
                w = min(stat, key=lambda c: c.value)
                vision = "" if w.data["vision"] == "normal" else f", {w.data['vision']}"
                return (f"{_trunc3(w.value)} ({w.data['pair'][1]}{vision})"
                        + ("" if w.outcome == "pass" else " ✗"))
            bad = [c for c in mine if c.outcome in ("error", "warning")]
            res_txt = "pass" if not bad else (
                "**FAIL**" if any(c.outcome == "error" for c in bad) else "warn")
            L.append(f"| {_md(pa['name'])} (`{pid}`) | `{C.normalize_hex(pa[mode]['accent'])}` | "
                     f"{g('accent|bg')} | {g('accent|surface')} | {g('accent|surface-raised')} | "
                     f"{g('accent|surface-sunken')} | {g(f'on-accent|{pid}.accent')} | "
                     f"{g(f'on-accent|{pid}.accent-hover')} | {g(f'on-accent|{pid}.accent-pressed')} | "
                     f"{g(f'text-on-accent-subtle|{pid}.accent-subtle')} | "
                     f"{worst_txt('P6')} | {worst_txt('P6-cvd')} | {res_txt} |")
        L.append("")
        L.append("Hover/pressed fills vs bg, surface, surface-raised (P1, warnings) appear in the "
                 "Errors/Warnings lists above when they fail.")
        L.append("")
        L.append("Pairwise distinctness (P4, all errors):")
        L.append("")
        L += _distinct_summary([c for c in rows if c.id.startswith("P4")])
        L.append("")
        L.append("Accent vs status (P6 normal vision >= 0.08 is a warning; P6-cvd >= 0.04 is an error):")
        L.append("")
        L += _distinct_summary([c for c in rows if c.id.startswith("P6")])
        L.append("")

    if pal.get("signTiles"):
        rows = by("tiles")
        L.append("## 3a. Sign tiles")
        L.append("")
        L.append(f"`signTiles` (contract {SIGN_TILES_SINCE} section 8.2): the tile and sign colours of the app signs, one "
                 "pair for both modes, checked only as sign colours. G1 sign on tile >= 3.0, G3 tile vs bg of each "
                 "mode >= 2.0, G2 groups pairwise deltaE OK >= 0.08 and >= 0.04 under each CVD (all errors).")
        L.append("")
        L.append("| Group | Purpose | tile | glyph | G1 glyph/tile | G3 vs light bg | G3 vs dark bg | Result |")
        L.append("|---|---|---|---|---|---|---|---|")
        for g in pal["signTiles"]["groups"]:
            mine = [c for c in rows if c.data.get("tileGroup") == g["id"]]
            pick = lambda cid, mode: next((c for c in mine if c.id == cid and c.mode == mode), None)

            def r(c: Check | None) -> str:
                return "—" if c is None else C.format_ratio(c.value) + ("" if c.outcome == "pass" else " ✗")
            bad = [c for c in mine if c.outcome == "error"]
            L.append(f"| {_md(g['name'])} (`{g['id']}`) | {_md(g['label'])} | `{C.normalize_hex(g['tile'])}` | "
                     f"`{C.normalize_hex(g['glyph'])}` | {r(pick('G1', None))} | {r(pick('G3', 'light'))} | "
                     f"{r(pick('G3', 'dark'))}"
                     + f" | {'**FAIL**' if bad else 'pass'} |")
        L.append("")
        L.append("Pairwise distinctness (G2, all errors):")
        L.append("")
        L += _distinct_summary([c for c in rows if c.id.startswith("G2")])
        L.append("")

    if pal.get("syntax"):
        L.append("## 3b. Code colours")
        L.append("")
        L.append(f"`syntax` (contract {SYNTAX_SINCE} section 8.4): colours of highlighted code, per mode. Y1 each role on "
                 "every surface >= 4.5, Y2 roles pairwise and against `text` and `text-muted` deltaE OK >= 0.08 and "
                 ">= 0.04 under each CVD, Y3 each role against `accent`, `link`, the status colours and `primary-action` "
                 "deltaE OK >= 0.08 (all errors).")
        L.append("")
        L.append("| Role | Name | light | dark | Y1 worst light | Y1 worst dark | Result |")
        L.append("|---|---|---|---|---|---|---|")
        for r in pal["syntax"]["roles"]:
            mine = [c for c in res.checks if c.data.get("syntaxRole") == r["id"]
                    or (c.group.startswith("syntax:") and f"syntax.{r['id']}" in c.data.get("pair", []))]
            worst = {m: min((c for c in mine if c.id == "Y1" and c.mode == m), key=lambda c: c.value, default=None)
                     for m in ("light", "dark")}
            bad = [c for c in mine if c.outcome == "error"]
            w = lambda c: "—" if c is None else f"{C.format_ratio(c.value)} on `{c.data['bgRole']}`"
            L.append(f"| `{r['id']}` | {_md(r['name'])} | `{C.normalize_hex(r['light'])}` | `{C.normalize_hex(r['dark'])}` | "
                     f"{w(worst['light'])} | {w(worst['dark'])} | {'**FAIL**' if bad else 'pass'} |")
        L.append("")
        for mode in ("light", "dark"):
            L.append(f"Distinctness, {mode} (Y2, Y3):")
            L.append("")
            L += _distinct_summary([c for c in by(f"syntax:{mode}") if c.id.startswith(("Y2", "Y3"))])
            L.append("")

    if pal.get("categories"):
        L.append("## 3c. Categories")
        L.append("")
        L.append(f"`categories` (contract {COLOUR_JOBS_SINCE} section 8.5): dot or glyph next to the word. C1 each tone on every "
                 "surface >= 3.0; C2 tones pairwise, C3 vs accent, link, status and primary-action, deltaE OK >= 0.08 and "
                 ">= 0.04 under each CVD; C4 vs the sign tiles >= 0.08 (under CVD reported only); C5 vs text, text-muted, "
                 f"border-strong >= {DE_GREY:g} (all errors unless noted).")
        L.append("")
        L.append("| No. | Name | light | dark | C1 worst light | C1 worst dark | Result |")
        L.append("|---|---|---|---|---|---|---|")
        for i, t in enumerate(pal["categories"]["tones"], 1):
            lab = f"category-{i}"
            mine = [c for c in res.checks if c.group.startswith("categories:")
                    and (c.data.get("category") == i or lab in c.data.get("pair", []))]
            worst = {m: min((c for c in mine if c.id == "C1" and c.mode == m), key=lambda c: c.value, default=None)
                     for m in ("light", "dark")}
            bad = [c for c in mine if c.outcome == "error"]
            w = lambda c: "—" if c is None else f"{C.format_ratio(c.value)} on `{c.data['bgRole']}`"
            L.append(f"| {i} | {_md(t['name'])} | `{C.normalize_hex(t['light'])}` | `{C.normalize_hex(t['dark'])}` | "
                     f"{w(worst['light'])} | {w(worst['dark'])} | {'**FAIL**' if bad else 'pass'} |")
        L.append("")
        for mode in ("light", "dark"):
            L.append(f"Distinctness, {mode} (C2-C5; C4-cvd is info):")
            L.append("")
            L += _distinct_summary([c for c in by(f"categories:{mode}") if c.metric.startswith("deltaE")])
            L.append("")

    if pal.get("mark"):
        L.append("## 3d. Mark")
        L.append("")
        L.append(f"`mark` (contract {COLOUR_JOBS_SINCE} section 8.6): M1 text, text-muted, link and code colours on the fill "
                 ">= 4.5; M2 edge on every surface >= 3.0; M3 fill vs selection and primary-action (deltaE OK >= 0.08, "
                 ">= 0.04 under CVD) and hover/pressed fills (>= 0.08); M4 edge vs accent, link, danger >= 0.08; M5 info.")
        L.append("")
        for mode in ("light", "dark"):
            rows = by(f"mark:{mode}")
            L.append(f"### {mode}: fill `{C.normalize_hex(pal['mark'][mode]['fill'])}`, edge "
                     f"`{C.normalize_hex(pal['mark'][mode]['edge'])}`")
            L.append("")
            L += _check_table([c for c in rows if c.metric == "wcag"])
            L.append("")
            L += _distinct_summary([c for c in rows if c.metric.startswith("deltaE")])
            L.append("")

    L.append("## 4. Data visualisation")
    L.append("")
    if pal["dataviz"].get("classed") is True:
        seq_max, div_max = class_limits(pal)
        lim = (f"at most {CLASS_MAX} classes" if (seq_max, div_max) == (CLASS_MAX, CLASS_MAX) else
               f"at most {seq_max} sequential and {div_max} diverging classes (dataviz.maxClasses, contract "
               f"{MAX_CLASSES_SINCE})")
        L.append(f"`dataviz.classed` (contract {COLOUR_JOBS_SINCE} section 9.1): the ground is class 0. D5 sequential, D6 "
                 f"diverging: {lim}; the first class (every class of an arm) >= "
                 f"{CLASS_GROUND_MIN:g} on every surface; neighbours >= {CLASS_STEP_MIN:g}:1 and deltaE OK >= "
                 f"{CLASS_DE_MIN:g} under normal vision and each CVD; more is farther from the ground; >= 0.08 from "
                 "accent and primary-action; the diverging midpoint is neutral and the two arms differ at every step "
                 "(all errors).")
        L.append("")
    for mode in ("light", "dark"):
        rows = by(f"dataviz:{mode}")
        dv = pal["dataviz"][mode]
        L.append(f"### {mode}")
        L.append("")
        L.append("- categorical: " + " ".join(f"`{C.normalize_hex(h)}`" for h in dv["categorical"]))
        L.append("- sequential: " + " ".join(f"`{C.normalize_hex(h)}`" for h in dv["sequential"]))
        L.append("- diverging: " + " ".join(f"`{C.normalize_hex(h)}`" for h in dv["diverging"]))
        L.append("")
        L += _check_table([c for c in rows if c.metric == "wcag" or c.metric in ("monotonic", "deltaL", "count", "chroma")])
        L.append("")
        L.append("Categorical distinctness (D2: normal >= 0.08 is an error, CVD >= 0.04 a warning) "
                 "and diverging ends (D4):")
        L.append("")
        L += _distinct_summary([c for c in rows if c.metric.startswith("deltaE")])
        L.append("")

    ex = [c for c in res.checks if c.group.startswith(("extras:", "scales:"))]
    L.append("## 5. Extras and scales")
    L.append("")
    if ex:
        L += _check_table(ex)
    else:
        L.append("None declared (no `extras.checks`, no `scales`).")
    L.append("")

    for vid, var in pal.get("variants", {}).items():
        vrows = [c for c in res.checks if c.data.get("variant") == vid]
        L.append(f"## 5a. Variant `{vid}` ({_md(var['name'])}, choice „{_md(var['label'])}“)")
        L.append("")
        L.append(f"Contract {COLOUR_JOBS_SINCE} section 8.7: the variant replaces "
                 + ", ".join(f"`{r}`" for r in var["light"]) + "; every check with a mode ran again with it.")
        L.append("")
        L.append("| Mode | Role | base | variant |")
        L.append("|---|---|---|---|")
        for mode in ("light", "dark"):
            for r, v in var[mode].items():
                base = pal["modes"][mode].get(r) or pal.get("extras", {}).get(mode, {}).get(r, "?")
                L.append(f"| {mode} | `{r}` | `{C.normalize_hex(base)}` | `{C.normalize_hex(v)}` |")
        L.append("")
        L.append("| Group | checks | pass | info | warnings | errors |")
        L.append("|---|---|---|---|---|---|")
        groups: list[str] = []
        for c in vrows:
            g = c.group.split(":", 2)[2]
            if g not in groups:
                groups.append(g)
        for g in groups:
            gr = [c for c in vrows if c.group.split(":", 2)[2] == g]
            n = lambda o: sum(1 for c in gr if c.outcome == o)
            L.append(f"| {g} | {len(gr)} | {n('pass')} | {n('info')} | {n('warning')} | {n('error')} |")
        L.append("")
        tight = sorted((c for c in vrows if c.metric == "wcag" and c.threshold is not None),
                       key=lambda c: c.value / c.threshold)[:8]
        L.append("Tightest contrast rows of the variant:")
        L.append("")
        L += _check_table(tight)
        L.append("")

    L.append("## 6. Light/dark kinship")
    L.append("")
    L.append("Hue shift between modes per role (OKLCH). Accent, link, focus, status and product "
             "accents warn above 25°; other roles are informational. Achromatic = C < 0.03.")
    L.append("")
    L.append("| Role | light | dark | ΔH | ΔL | ΔC | Result | Note |")
    L.append("|---|---|---|---|---|---|---|---|")
    for c in by("kinship"):
        d = c.data
        lo, dk = d["light"], d["dark"]
        L.append(f"| {_md(c.subject)} | `{lo['hex']}` L{lo['L']:.3f} C{lo['C']:.3f} H{lo['H']:.0f} | "
                 f"`{dk['hex']}` L{dk['L']:.3f} C{dk['C']:.3f} H{dk['H']:.0f} | "
                 + (f"{d['dH']:.1f}°" if d["dH"] is not None else "n/a")
                 + f" | {d['dL']:+.3f} | {d['dC']:+.3f} | {_OUT[c.outcome]} | {_md(c.note)} |")
    L.append("")
    L.append("## Method")
    L.append("")
    L.append("- WCAG 2.x contrast (WCAG 2.2 relative luminance, 0.04045 threshold); ratios are "
             "shown truncated to 2 decimals and compared unrounded. deltaE OK and lightness steps "
             "are shown truncated to 3 decimals, also compared unrounded.")
    L.append(f"- APCA Lc ({C.APCA_VERSION}) is reported for every contrast pair; it is advisory and "
             "never changes a verdict. `(< n)` marks values below the APCA reference level for "
             "that use (body 75, content 60, large 45, non-text 30, divider 15).")
    L.append("- deltaE OK = Euclidean OKLab distance (raw units, JND 0.02). CVD = Machado et al. "
             "2009, severity 1.0, linear RGB. Alpha roles are composited (source-over, sRGB) "
             "before measuring.")
    return "\n".join(L) + "\n"


def _distinct_summary(rows: list[Check]) -> list[str]:
    """One line per (check family, vision): pair count, worst pair, failing pairs."""
    if not rows:
        return ["(none)"]
    out = ["| ID | Vision | pairs | min ΔE OK | min pair | threshold | failing pairs |",
           "|---|---|---|---|---|---|---|"]
    keys: list[tuple[str, str]] = []
    for c in rows:
        k = (c.id.removesuffix("-cvd"), c.data.get("vision", "normal"))
        if k not in keys:
            keys.append(k)
    for fam, v in keys:
        vr = [c for c in rows
              if c.id.removesuffix("-cvd") == fam and c.data.get("vision", "normal") == v]
        worst = min(vr, key=lambda c: c.value)
        fails = [c for c in vr if c.outcome in ("error", "warning")]
        thr = "—" if worst.threshold is None else f"≥ {worst.threshold:g} ({worst.severity})"
        fail_txt = "; ".join(f"{'/'.join(c.data['pair'])} {_trunc3(c.value)}" for c in fails) or "none"
        out.append(f"| {fam} | {v} | {len(vr)} | {_trunc3(worst.value)} | {'/'.join(worst.data['pair'])} | "
                   f"{thr} | {_md(fail_txt)} |")
    return out


# ============================================================================= JSON report

def render_json(res: PaletteResult) -> dict:
    pal = res.palette if isinstance(res.palette, dict) else {}
    meta = pal.get("meta", {})
    return {
        "tool": {"name": "check_palette.py", "version": TOOL_VERSION, "apca": C.APCA_VERSION,
                 "colorLib": C.__version__},
        "file": res.file,
        "palette": {k: meta.get(k) for k in ("slug", "name", "status", "author", "date")},
        "schemaVersion": pal.get("schemaVersion"),
        "verdict": "pass" if res.ok else "fail",
        "matrixRan": res.matrix_ran,
        "counts": {k: res.count(k) for k in ("error", "warning", "pass", "info")},
        "findings": [asdict(f) for f in res.findings],
        "checks": [_json_check(c) for c in res.checks],
        **({"families": families_of(pal)} if res.matrix_ran and "productMap" in pal else {}),
        **({"tileGroups": [g["id"] for g in pal["signTiles"]["groups"]]} if res.matrix_ran and pal.get("signTiles") else {}),
        **({"syntaxRoles": [r["id"] for r in pal["syntax"]["roles"]]} if res.matrix_ran and pal.get("syntax") else {}),
        **({"categories": [t["name"] for t in pal["categories"]["tones"]]} if res.matrix_ran and pal.get("categories") else {}),
        **({"variants": list(pal["variants"])} if res.matrix_ran and pal.get("variants") else {}),
    }


def _json_check(c: Check) -> dict:
    """One check row. A WCAG `value` is truncated to 2 decimals like every displayed ratio (D20);
    `outcome` was decided on the unrounded ratio (recompute it with color.py contrast fg bg)."""
    row = {**asdict(c), "outcome": c.outcome}
    if c.metric == "wcag" and c.value is not None:
        row["value"] = float(C.format_ratio(c.value))
    return row


# ============================================================================= HTML swatch sheet

_HTML_CSS = """
:root{--page:#F3F3F1;--ink:#1A1A1A;--line:#D4D4D0;--muted:#5C5C58;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--page:#121212;--ink:#EAEAE6;--line:#34342F;--muted:#A3A39C}}
:root[data-theme="dark"]{--page:#121212;--ink:#EAEAE6;--line:#34342F;--muted:#A3A39C}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--ink);font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header.top{padding:24px 16px 8px;max-width:1500px;margin:0 auto}
header.top h1{margin:0 0 4px;font-size:22px}
header.top p{margin:2px 0;color:var(--muted)}
.verdict{display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;border:1px solid currentColor}
.modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,640px),1fr));gap:16px;padding:16px;max-width:1500px;margin:0 auto}
.mode{border-radius:12px;padding:20px;border:1px solid var(--line)}
.mode h2{margin:0 0 12px;font-size:18px}
.mode h3{margin:20px 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:.06em}
.layers{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
.layer{border-radius:8px;padding:12px;min-height:120px}
.layer .t{font-size:15px}
.layer small{display:block;font-size:11px;opacity:.9}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.sw{border-radius:8px;overflow:hidden;font-size:11px;line-height:1.35}
.sw .chip{height:44px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px}
.sw .meta{padding:6px 8px}
.sw code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px}
.bad{font-weight:700;text-decoration:underline}
.row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.btn{border-radius:8px;padding:8px 14px;font-weight:600;font-size:14px;border:0}
.pill{border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600}
.bars{display:flex;gap:4px;align-items:flex-end;height:64px}
.bars span{flex:1;border-radius:3px 3px 0 0}
.strip{display:flex;height:28px;border-radius:6px;overflow:hidden}
.strip span{flex:1}
table.checks{border-collapse:collapse;width:100%;font-size:12px}
table.checks th,table.checks td{border-bottom:1px solid var(--line);padding:4px 6px;text-align:left;vertical-align:top}
.wrap{max-width:1500px;margin:0 auto;padding:0 16px 32px;overflow-x:auto}
details summary{cursor:pointer;font-weight:600;margin:12px 0}
"""


def _e(s: Any) -> str:
    return html.escape(str(s), quote=True)


def render_html(res: PaletteResult) -> str:
    pal = res.palette
    if not (isinstance(pal, dict) and res.matrix_ran):
        body = "<p>The palette did not pass schema/semantic validation; no swatches rendered.</p><ul>"
        body += "".join(f"<li><code>{_e(f.where)}</code> {_e(f.message)}</li>" for f in res.findings)
        return (f"<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" "
                f"content=\"width=device-width,initial-scale=1\"><title>Palette check</title><style>{_HTML_CSS}"
                f"</style></head><body><header class=\"top\"><h1>{_e(res.file)}</h1></header>"
                f"<div class=\"wrap\">{body}</ul></div></body></html>")
    m = Matrix(pal)
    meta = pal["meta"]
    verdict = "PASS" if res.ok else "FAIL"
    parts = [
        "<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\">",
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
        f"<title>{_e(meta['name'])}: palette sheet</title><style>{_HTML_CSS}</style></head><body>",
        "<header class=\"top\">",
        f"<h1>{_e(meta['name'])} <small>({_e(meta['slug'])}, {_e(meta['status'])})</small></h1>",
        f"<p>{_e(meta['concept'])}</p>",
        f"<p><span class=\"verdict\">{verdict}</span> {res.count('error')} errors · "
        f"{res.count('warning')} warnings · {res.count('pass')} passed · file <code>{_e(res.file)}</code>"
        f" · checker {TOOL_VERSION} · ratios WCAG 2.x (truncated), Lc = APCA (advisory)</p>",
        "</header><main class=\"modes\">",
    ]
    failing = {(c.mode, c.data.get("fgRole"), c.data.get("bgRole"))
               for c in res.checks if c.outcome in ("error", "warning") and c.metric == "wcag"}

    def ratio_txt(mode, fg_role, bg_role, fg, bg):
        r, lc = C.wcag_contrast(fg, bg), C.apca_contrast(fg, bg)
        cls = " class=\"bad\"" if (mode, fg_role, bg_role) in failing else ""
        return f"<span{cls}>{C.format_ratio(r)}:1</span> · Lc {lc:+.0f}"

    for mode, label in (("light", "Hell (light)"), ("dark", "Dunkel (dark)")):
        R = {r: m.eff(mode, r) for r in CORE_ROLES}
        parts.append(f"<section class=\"mode\" style=\"background:{R['bg']};color:{R['text']}\">")
        parts.append(f"<h2>{label}</h2>")
        # layers with text samples
        parts.append("<h3>Flächen und Text</h3><div class=\"layers\">")
        for s in SURFACES:
            parts.append(
                f"<div class=\"layer\" style=\"background:{R[s]};border:1px solid {R['border']}\">"
                f"<small style=\"color:{R['text-muted']}\">{_e(s)} <code>{R[s]}</code></small>"
                f"<div class=\"t\" style=\"color:{R['text']}\">Text {ratio_txt(mode, 'text', s, R['text'], R[s])}</div>"
                f"<div class=\"t\" style=\"color:{R['text-muted']}\">Muted {ratio_txt(mode, 'text-muted', s, R['text-muted'], R[s])}</div>"
                f"<div class=\"t\" style=\"color:{R['text-subtle']}\">Subtle {ratio_txt(mode, 'text-subtle', s, R['text-subtle'], R[s])}</div>"
                f"<div class=\"t\"><a href=\"#\" style=\"color:{R['link']}\">Link</a> "
                f"<small style=\"color:{R['link']}\">{ratio_txt(mode, 'link', s, R['link'], R[s])}</small></div>"
                "</div>")
        parts.append("</div>")
        # components
        parts.append("<h3>Komponenten</h3><div class=\"row\">")
        for st_role, lbl in (("accent", "Primär"), ("accent-hover", "Hover"), ("accent-pressed", "Pressed")):
            parts.append(f"<button class=\"btn\" style=\"background:{R[st_role]};color:{R['on-accent']}\">"
                         f"{lbl} {C.format_ratio(C.wcag_contrast(R['on-accent'], R[st_role]))}</button>")
        parts.append(f"<span class=\"pill\" style=\"background:{R['accent-subtle']};color:{R['text-on-accent-subtle']}\">"
                     f"accent-subtle {C.format_ratio(C.wcag_contrast(R['text-on-accent-subtle'], R['accent-subtle']))}</span>")
        parts.append(f"<button class=\"btn\" style=\"background:{R['surface']};color:{R['text']};"
                     f"border:1px solid {R['border-strong']};outline:2px solid {R['focus']};outline-offset:2px\">"
                     f"Fokus {C.format_ratio(C.wcag_contrast(R['focus'], R['bg']))}</button>")
        parts.append(f"<span style=\"background:{R['selection']};padding:2px 4px\">markierter Text</span>")
        parts.append("</div><div class=\"row\" style=\"margin-top:8px\">")
        for st in STATUSES:
            parts.append(f"<span class=\"pill\" style=\"background:{R[st + '-subtle']};color:{R['text-on-' + st + '-subtle']}\">"
                         f"{st} {C.format_ratio(C.wcag_contrast(R['text-on-' + st + '-subtle'], R[st + '-subtle']))}</span>"
                         f"<span class=\"pill\" style=\"background:{R[st]};color:{R['on-' + st]}\">"
                         f"{C.format_ratio(C.wcag_contrast(R['on-' + st], R[st]))}</span>")
        parts.append("</div>")
        # swatch grid
        parts.append("<h3>Alle Rollen</h3><div class=\"grid\">")
        for role in CORE_ROLES:
            raw = C.normalize_hex(pal["modes"][mode][role])
            hx = R[role]
            Lh, Ch, Hh = C.to_oklch(hx)
            pair = PRIMARY_PAIR.get(role)
            chip_fg = "#000000" if C.wcag_contrast("#000000", hx) >= C.wcag_contrast("#FFFFFF", hx) else "#FFFFFF"
            info = ""
            if pair:
                bgc = R[pair]
                if role in ALPHA_ROLES:
                    info = f"over {pair}: <code>{hx}</code>"
                else:
                    info = f"vs {_e(pair)}: {ratio_txt(mode, role, pair, hx, bgc)}"
            parts.append(
                f"<div class=\"sw\" style=\"background:{R['surface']};border:1px solid {R['border']}\">"
                f"<div class=\"chip\" style=\"background:{hx};color:{chip_fg}\">{_e(role)}</div>"
                f"<div class=\"meta\" style=\"color:{R['text']}\"><code>{raw}</code><br>"
                f"<span style=\"color:{R['text-muted']}\">L {Lh:.3f} C {Ch:.3f} H {Hh:.0f}</span><br>{info}</div></div>")
        parts.append("</div>")
        # product accents (accent families with a productMap, contract 2.1)
        fams = families_of(pal) if "productMap" in pal else None
        if accents_of(pal):
            parts.append(f"<h3>{'Akzentfamilien' if fams is not None else 'Produktakzente'}</h3><div class=\"row\">")
        for pa in accents_of(pal):
            s = {k: C.normalize_hex(v) for k, v in pa[mode].items()}
            parts.append(
                f"<button class=\"btn\" title=\"{_e(pa.get('intent', ''))}\" style=\"background:{s['accent']};color:{s['on-accent']}\">"
                f"{_e(pa['name'])} {C.format_ratio(C.wcag_contrast(s['on-accent'], s['accent']))}</button>"
                f"<span class=\"pill\" style=\"background:{s['accent-subtle']};color:{s['text-on-accent-subtle']}\">"
                f"{C.format_ratio(C.wcag_contrast(s['text-on-accent-subtle'], s['accent-subtle']))}</span>")
            if fams is not None:
                parts.append(f"<small style=\"color:{R['text-muted']}\">{_e(', '.join(fams[pa['id']]) or 'frei')}</small>")
        if accents_of(pal):
            parts.append("</div>")
        if pal.get("signTiles"):   # sign tiles (contract 2.2): one pair for both modes, shown on this mode's ground
            parts.append("<h3>Kachelfarben</h3><div class=\"row\">")
            for g in pal["signTiles"]["groups"]:
                t, gl = C.normalize_hex(g["tile"]), C.normalize_hex(g["glyph"])
                parts.append(
                    f"<button class=\"btn\" title=\"{_e(g['label'])}\" style=\"background:{t};color:{gl}\">"
                    f"{_e(g['name'])} {C.format_ratio(C.wcag_contrast(gl, t))}</button>")
            parts.append("</div>")
        if pal.get("syntax"):   # code colours (contract 2.4) on this mode's sunken code ground
            sunk = R["surface-sunken"]
            parts.append(f"<h3>Codefarben</h3><div class=\"row\" style=\"background:{sunk};padding:6px;border-radius:6px;"
                         "font-family:ui-monospace,monospace\">")
            for r in pal["syntax"]["roles"]:
                h = C.normalize_hex(r[mode])
                parts.append(f"<span title=\"{_e(r['label'])}\" style=\"color:{h}\">{_e(r['id'])} "
                             f"{C.format_ratio(C.wcag_contrast(h, sunk))}</span>")
            parts.append("</div>")
        if pal.get("categories"):   # categories (contract 2.5): dots next to the word on this mode's ground
            parts.append("<h3>Kategorien</h3><div class=\"row\">")
            for t in pal["categories"]["tones"]:
                h = C.normalize_hex(t[mode])
                parts.append(f"<span><span style=\"display:inline-block;width:10px;height:10px;border-radius:50%;"
                             f"background:{h}\"></span> {_e(t['name'])} {C.format_ratio(C.wcag_contrast(h, R['bg']))}</span>")
            parts.append("</div>")
        if pal.get("mark"):   # mark (contract 2.5): fill with edge behind text
            f_, e_ = C.normalize_hex(pal["mark"][mode]["fill"]), C.normalize_hex(pal["mark"][mode]["edge"])
            parts.append(f"<h3>Markierung</h3><p>Ein <span style=\"background:{f_};border-bottom:2px solid {e_}\">"
                         f"markiertes Wort</span> im Satz · Text {C.format_ratio(C.wcag_contrast(R['text'], f_))} · Kante "
                         f"{C.format_ratio(C.wcag_contrast(e_, R['bg']))}</p>")
        # dataviz
        dv = pal["dataviz"][mode]
        parts.append(f"<h3>Datenvisualisierung</h3><div class=\"bars\" style=\"background:{R['surface']};padding:6px;border-radius:6px\">")
        for i, h in enumerate(dv["categorical"]):
            parts.append(f"<span title=\"{C.normalize_hex(h)} {C.format_ratio(C.wcag_contrast(h, R['bg']))}:1\" "
                         f"style=\"background:{h};height:{40 + (i * 37) % 60}%\"></span>")
        parts.append("</div><div class=\"strip\" style=\"margin-top:8px\">")
        parts += [f"<span title=\"{C.normalize_hex(h)}\" style=\"background:{h}\"></span>" for h in dv["sequential"]]
        parts.append("</div><div class=\"strip\" style=\"margin-top:8px\">")
        parts += [f"<span title=\"{C.normalize_hex(h)}\" style=\"background:{h}\"></span>" for h in dv["diverging"]]
        parts.append("</div></section>")
    parts.append("</main><div class=\"wrap\">")
    bad = [c for c in res.checks if c.outcome in ("error", "warning")]
    parts.append(f"<h2>Befunde ({len(bad)})</h2>")
    if res.findings:
        parts.append("<ul>" + "".join(f"<li>{_e(f.severity)}: <code>{_e(f.where)}</code> {_e(f.message)}</li>"
                                      for f in res.findings) + "</ul>")
    parts.append(_html_table(bad) if bad else "<p>Keine Fehler oder Warnungen.</p>")
    parts.append("<details><summary>Alle Prüfzeilen</summary>" + _html_table(res.checks) + "</details>")
    parts.append("</div></body></html>")
    return "".join(parts)


def _html_table(rows: list[Check]) -> str:
    out = ["<table class=\"checks\"><thead><tr><th>ID</th><th>Mode</th><th>Check</th><th>FG</th><th>BG</th>"
           "<th>Value</th><th>Min</th><th>APCA</th><th>Result</th><th>Note</th></tr></thead><tbody>"]
    for c in rows:
        out.append(f"<tr><td>{_e(c.id)}</td><td>{_e(c.mode or '')}</td><td>{_e(c.subject)}</td>"
                   f"<td><code>{_e(c.fg or '')}</code></td><td><code>{_e(c.bg or '')}</code></td>"
                   f"<td>{_e(_val(c))}</td><td>{_e(_thr(c))}</td><td>{_e(_apca(c))}</td>"
                   f"<td>{_e(c.outcome)}</td><td>{_e(c.note)}</td></tr>")
    out.append("</tbody></table>")
    return "".join(out)


# ============================================================================= CLI

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="check_palette.py",
                                 description="Validate sebaroDesign palette files (schema + check matrix).")
    ap.add_argument("palettes", nargs="+", type=pathlib.Path, help="palette JSON file(s)")
    ap.add_argument("--json", action="store_true", help="emit JSON instead of Markdown")
    ap.add_argument("--report", type=pathlib.Path, help="also write the report (Markdown, or JSON with --json)")
    ap.add_argument("--html", type=pathlib.Path, help="write a self-contained HTML swatch sheet")
    ap.add_argument("--strict", action="store_true", help="treat warnings as errors for the exit code")
    ap.add_argument("--schema", type=pathlib.Path, default=SCHEMA_PATH, help=argparse.SUPPRESS)
    ap.add_argument("--version", action="version", version=f"%(prog)s {TOOL_VERSION}")
    a = ap.parse_args(argv)
    if (a.report or a.html) and len(a.palettes) != 1:
        ap.error("--report and --html need exactly one palette file")
    try:
        schema = load_schema(a.schema)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"error: cannot load schema {a.schema}: {exc}", file=sys.stderr)
        return 2

    worst = 0
    outputs: list[str] = []
    json_out: list[dict] = []
    for p in a.palettes:
        try:
            res = check_palette_file(p, schema)
        except UnsupportedSchema as exc:
            print(f"error: schema/checker mismatch: {exc}", file=sys.stderr)
            return 2
        if a.json:
            json_out.append(render_json(res))
        else:
            outputs.append(render_markdown(res))
        if not res.ok or (a.strict and res.count("warning")):
            worst = 1
        if a.html:
            a.html.parent.mkdir(parents=True, exist_ok=True)
            a.html.write_text(render_html(res), encoding="utf-8")
    text = (json.dumps(json_out[0] if len(json_out) == 1 else json_out, indent=2, ensure_ascii=False)
            + "\n") if a.json else "\n---\n\n".join(outputs)
    sys.stdout.write(text)
    if a.report:
        a.report.parent.mkdir(parents=True, exist_ok=True)
        a.report.write_text(text, encoding="utf-8")
    return worst


if __name__ == "__main__":
    sys.exit(main())
