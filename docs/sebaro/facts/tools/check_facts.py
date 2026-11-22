#!/usr/bin/env python3
"""Validate a product facts file (facts.json) and verify it against the real build configuration.

    python3 tools/check_facts.py shared/facts/studio.json                     # schema + semantic rules
    python3 tools/check_facts.py shared/facts/*.json --json                   # machine-readable, incl. render view
    python3 tools/check_facts.py facts.json --app-version 1.4.0               # staleness against the build
    python3 tools/check_facts.py facts.json --android-manifest app/build/intermediates/merged_manifests/release/AndroidManifest.xml \\
        --android-res app/src/main/res --deps build/deps-release.txt --ci   # Android CI
    python3 tools/check_facts.py facts.json --csp dist/index.html --deps package-lock.json --ci   # website / web app
    python3 tools/check_facts.py facts.json --csp "default-src 'self'; connect-src 'self'"      # header string
    python3 tools/check_facts.py facts.json --tauri src-tauri/tauri.conf.json --deps Cargo.lock --deps pnpm-lock.yaml
    python3 tools/check_facts.py --list-blocklist                             # the built-in tracker-SDK list
    python3 tools/check_facts.py shared/facts/studio.json --notes --today 2026-10-11   # note data per claim and check
    python3 tools/check_facts.py shared/facts/studio.json --notes \\
        --note tracking.analytics,tracking.adIds,tracking.cookies --note places.fsn  # numbered notes 1, 2

Exit codes: 0 = no errors (warnings allowed unless --strict); 1 = at least one error (schema, semantic rule,
verifier) or an unreadable facts file; 2 = usage error, unreadable schema, or a schema keyword the validator
does not implement (fail loud instead of skipping it).

--notes (implies --json) adds the data a footnote or claim-row renderer needs: state, check date, next due date,
method, who checked ("Eigene Prüfung, automatisch" / "von Hand"), "Nicht geprüft: …" limits and the outflows that
belong to a claim (FACTS-CONTRACT section 8.6). Without --notes the output is the same as checker 1.0.0's, apart
from the version numbers.

Nothing is ever written. Python 3.10+, standard library only (shares the JSON-Schema subset validator of
tools/check_palette.py). Normative description: shared/FACTS-CONTRACT.md. Schema: shared/facts.schema.json.
"""
from __future__ import annotations

import argparse
import datetime as dt
import fnmatch
import html.parser
import json
import pathlib
import re
import sys
sys.dont_write_bytecode = True   # a copy runs this checker from its facts/ folder: no __pycache__ there (the strict check refuses it)
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass, field
from typing import Any

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
import check_palette as CP  # noqa: E402

TOOL_VERSION = "1.3.1"   # 1.3.1: sys.dont_write_bytecode, so the checker a copy carries in facts/ leaves no __pycache__ (python3 -B no longer needed); 1.3.0 before
CONTRACT_VERSION = "1.3"
# Versions a facts file may declare in schemaVersion (schema enum). All 1.x additions keep older files valid.
CONTRACT_VERSIONS_ACCEPTED = ("1.0", "1.1", "1.2", "1.3")
SCHEMA_PATH = ROOT / "shared" / "facts.schema.json"

# ============================================================================= the contract

CHECK_STATES = ("passed", "open", "skipped", "failed")
TRIGGERS = ("automatic", "on-user-command", "never")
TRIGGER_RANK = {"never": 0, "on-user-command": 1, "automatic": 2}
REMOTE_KINDS = ("server", "third-party")
LOCAL_KINDS = ("device", "user-destination")
VERIFIERS = ("android-manifest", "csp", "tauri", "deps")
COUNTERS = ("trackers", "analytics", "adIds", "cookies")
WEB_KINDS = ("website", "web-app")
# EU 27 + EEA (IS, LI, NO). Used for the derived `outsideEEA` list only; never a pass/fail criterion.
EEA = frozenset("AT BE BG CY CZ DE DK EE ES FI FR GR HR HU IE IT LT LU LV MT NL PL PT RO SE SI SK IS LI NO".split())
NOT_A_COUNTRY = frozenset({"EU", "EZ", "UN", "XX", "ZZ"})
# 1.2 (D90): legal areas a remote place may name instead of a city (and country) when the operator keeps the data
# inside it by contract, e.g. a provider's "EU jurisdiction". Section 5.5, rule PL1.
JURISDICTIONS = ("EU", "EEA")
CLOUD_RE = re.compile(r"cloud|wolke", re.I)
LANG_KEY_RE = re.compile(r"^[a-z]{2}(-[A-Z]{2})?$")

ANDROID_NS = "{http://schemas.android.com/apk/res/android}"
TOOLS_NS = "{http://schemas.android.com/tools}"
PERM_INTERNET = "android.permission.INTERNET"
PERM_AD_ID = "com.google.android.gms.permission.AD_ID"

# ----------------------------------------------------------------------------- tracker-SDK blocklist
# category: tracker | analytics -> the matching tracking counter must be > 0 (DP1);
#           adid                -> tracking.adIds must be > 0 (DP1);
#           declare-path        -> not a tracker by default, but it sends data to a third party, so a
#                                  dependencies.items[] entry with `dataPath` must declare it (DP3).
# Patterns are "<ecosystem>:<name>" with fnmatch wildcards; ecosystems: maven, npm, cargo.
# INCOMPLETE BY DESIGN: a small list of the SDKs most often found in Android/web/Tauri apps. A clean result
# means "none of these", not "no tracker". Exodus Privacy (reports.exodus-privacy.eu.org) keeps a far larger
# list of Android signatures; this list is not synced with it.
BLOCKLIST: tuple[dict, ...] = (
    {"name": "Firebase Analytics", "category": "tracker",
     "match": ("maven:com.google.firebase:firebase-analytics*", "maven:com.google.android.gms:play-services-measurement*",
               "npm:@firebase/analytics", "npm:@react-native-firebase/analytics")},
    {"name": "Firebase Crashlytics", "category": "tracker",
     "match": ("maven:com.google.firebase:firebase-crashlytics*", "npm:@react-native-firebase/crashlytics")},
    {"name": "Google Analytics", "category": "tracker",
     "match": ("maven:com.google.android.gms:play-services-analytics*", "npm:react-ga", "npm:react-ga4",
               "npm:ga-4-react", "npm:vue-gtag", "npm:universal-analytics")},
    {"name": "Google Mobile Ads (AdMob)", "category": "tracker",
     "match": ("maven:com.google.android.gms:play-services-ads", "maven:com.google.android.gms:play-services-ads-lite",
               "npm:react-native-google-mobile-ads")},
    {"name": "Google advertising ID", "category": "adid",
     "match": ("maven:com.google.android.gms:play-services-ads-identifier",)},
    {"name": "AppsFlyer", "category": "tracker",
     "match": ("maven:com.appsflyer:*", "npm:react-native-appsflyer", "npm:appsflyer-*")},
    {"name": "Adjust", "category": "tracker",
     "match": ("maven:com.adjust.sdk:*", "npm:react-native-adjust", "npm:@adjustcom/*")},
    {"name": "Facebook SDK", "category": "tracker",
     "match": ("maven:com.facebook.android:*", "npm:react-native-fbsdk*")},
    {"name": "Branch", "category": "tracker", "match": ("maven:io.branch.sdk.android:*", "npm:react-native-branch")},
    {"name": "Flurry", "category": "tracker", "match": ("maven:com.flurry.android:*",)},
    {"name": "OneSignal", "category": "tracker", "match": ("maven:com.onesignal:*", "npm:react-onesignal", "npm:onesignal-*")},
    {"name": "Unity Ads", "category": "tracker", "match": ("maven:com.unity3d.ads:*",)},
    {"name": "ironSource", "category": "tracker", "match": ("maven:com.ironsource.sdk:*",)},
    {"name": "Amplitude", "category": "analytics",
     "match": ("maven:com.amplitude:*", "npm:@amplitude/*", "npm:amplitude-js")},
    {"name": "Mixpanel", "category": "analytics",
     "match": ("maven:com.mixpanel.android:*", "npm:mixpanel-browser", "npm:mixpanel")},
    {"name": "Segment", "category": "analytics",
     "match": ("maven:com.segment.analytics.*", "npm:@segment/analytics-*", "npm:analytics-node")},
    {"name": "PostHog", "category": "analytics", "match": ("maven:com.posthog:*", "npm:posthog-js", "npm:posthog-node", "cargo:posthog-rs")},
    {"name": "Microsoft Clarity", "category": "analytics", "match": ("maven:com.microsoft.clarity:*", "npm:@microsoft/clarity")},
    {"name": "Hotjar", "category": "analytics", "match": ("npm:@hotjar/browser", "npm:react-hotjar")},
    {"name": "Matomo", "category": "analytics",
     "match": ("maven:org.matomo.sdk:*", "npm:@datapunt/matomo-tracker-*", "npm:matomo-tracker", "npm:@jonkoops/matomo-tracker*")},
    {"name": "Plausible", "category": "analytics", "match": ("npm:plausible-tracker", "npm:@plausible-analytics/*")},
    {"name": "Aptabase", "category": "analytics", "match": ("npm:@aptabase/*", "cargo:tauri-plugin-aptabase")},
    {"name": "Sentry", "category": "declare-path",
     "match": ("maven:io.sentry:*", "npm:@sentry/*", "cargo:sentry", "cargo:sentry-*")},
    {"name": "Bugsnag", "category": "declare-path", "match": ("maven:com.bugsnag:*", "npm:@bugsnag/*")},
    {"name": "Firebase Cloud Messaging", "category": "declare-path",
     "match": ("maven:com.google.firebase:firebase-messaging*", "npm:@react-native-firebase/messaging")},
)

# Hosts that identify trackers/analytics inside a CSP (rule CS4). Same caveat: incomplete.
TRACKER_HOSTS: tuple[tuple[str, str, str], ...] = (
    ("google-analytics.com", "Google Analytics", "tracker"),
    ("analytics.google.com", "Google Analytics", "tracker"),
    ("googletagmanager.com", "Google Tag Manager", "tracker"),
    ("doubleclick.net", "Google Ads (DoubleClick)", "tracker"),
    ("googlesyndication.com", "Google AdSense", "tracker"),
    ("connect.facebook.net", "Facebook Pixel", "tracker"),
    ("hotjar.com", "Hotjar", "analytics"),
    ("clarity.ms", "Microsoft Clarity", "analytics"),
    ("segment.com", "Segment", "analytics"),
    ("segment.io", "Segment", "analytics"),
    ("mixpanel.com", "Mixpanel", "analytics"),
    ("amplitude.com", "Amplitude", "analytics"),
    ("plausible.io", "Plausible", "analytics"),
    ("matomo.cloud", "Matomo Cloud", "analytics"),
    ("posthog.com", "PostHog", "analytics"),
)

CSP_FETCH = ("connect-src", "script-src", "script-src-elem", "script-src-attr", "style-src", "style-src-elem",
             "style-src-attr", "img-src", "font-src", "media-src", "frame-src", "child-src", "worker-src",
             "manifest-src", "object-src")
CSP_LOCAL_SCHEMES = frozenset({"data", "blob", "mediastream", "filesystem", "ipc", "tauri", "asset", "about"})
CSP_LOCAL_HOSTS = frozenset({"localhost", "127.0.0.1", "[::1]"})

# ----------------------------------------------------------------------------- notes (--notes, FACTS-CONTRACT 8.6)
# Display words for the notes output. The check-state words and the fixed state words are the contract's
# (sections 6.3, 6.5); "Eigene Prüfung" is D40; "Nicht geprüft" and the date phrases are research/12 section 6.8.
STATE_LABELS = {"passed": {"de": "bestanden", "en": "passed"}, "open": {"de": "offen", "en": "open"},
                "skipped": {"de": "übersprungen", "en": "skipped"}, "failed": {"de": "nicht bestanden", "en": "failed"}}
DATE_PHRASES = {"passed": {"de": "geprüft am {d}", "en": "checked on {d}"},
                "failed": {"de": "geprüft am {d}", "en": "checked on {d}"},
                "open": {"de": "offen seit {d}", "en": "open since {d}"},
                "skipped": {"de": "übersprungen am {d}", "en": "skipped on {d}"}}
BY_LABELS = {"automatic": {"de": "Eigene Prüfung, automatisch", "en": "Own check, automated"},
             "manual": {"de": "Eigene Prüfung, von Hand", "en": "Own check, by hand"},
             "mixed": {"de": "Eigene Prüfung, automatisch und von Hand", "en": "Own check, automated and by hand"},
             "unknown": {"de": "Eigene Prüfung", "en": "Own check"}}
LIMIT_PHRASE = {"de": "Nicht geprüft: {t}", "en": "Not checked: {t}"}
FOR_VERSION_PHRASE = {"de": "für {v}", "en": "for {v}"}
NEXT_DUE_PHRASE = {"de": "Nächste Prüfung fällig am {d}", "en": "Next check due on {d}"}
STALE_PHRASE = {"de": "Nicht für diese Version geprüft (geprüft für {v} am {d})",
                "en": "Not verified for this version (verified for {v} on {d})"}
DEMO_LABEL = {"de": "Beispieldaten", "en": "Demo data"}
NOT_VERIFIED_LABEL = {"de": "nicht belegt", "en": "not verified"}
PLACE_NOT_VERIFIED_LABEL = {"de": "Ort nicht belegt", "en": "location not verified"}
JURISDICTION_LABELS = {"EU": {"de": "Rechtsraum EU", "en": "EU jurisdiction"},
                       "EEA": {"de": "Rechtsraum EWR", "en": "EEA jurisdiction"}}
DATA_LABELS = {"content": {"de": "deine Inhalte", "en": "your content"},
               "settings": {"de": "Einstellungen", "en": "settings"},
               "account": {"de": "Kontodaten", "en": "account data"},
               "ip-address": {"de": "IP-Adresse", "en": "IP address"},
               "device-info": {"de": "Geräte- und Browserangaben", "en": "device and browser details"},
               "usage": {"de": "Nutzungsdaten", "en": "usage data"},
               "crash-report": {"de": "Absturzberichte", "en": "crash reports"},
               "contact": {"de": "Kontaktdaten", "en": "contact details"},
               "search-terms": {"de": "Suchbegriffe", "en": "search terms"}}
TRIGGER_LABELS = {"automatic": {"de": "automatisch", "en": "automatically"},
                  "on-user-command": {"de": "nur auf deinen Befehl", "en": "only when you ask"},
                  "never": {"de": "nie", "en": "never"}}
TRANSPORT_LABELS = {"tls": {"de": "verschlüsselt (TLS)", "en": "encrypted (TLS)"},
                    "end-to-end": {"de": "Ende-zu-Ende", "en": "end-to-end"},
                    "none": {"de": "unverschlüsselt", "en": "unencrypted"},
                    "local": {"de": "ohne Netz", "en": "no network"}}
RETENTION_LABELS = {"none": {"de": "nicht gespeichert", "en": "not stored"},
                    "session": {"de": "bis zum Schließen", "en": "until closed"},
                    "until-deleted": {"de": "bis du es löschst", "en": "until you delete it"},
                    "user-controlled": {"de": "liegt bei dir", "en": "yours to keep"},
                    "processor-terms": {"de": "nach den Bedingungen von {o}", "en": "under {o}'s terms"}}
# What a verifier cannot see (section 10.5): the limit a note shows when the check names this verifier and has no
# `limit` of its own. {n} = blocklist entries that count against a tracking counter (the list grows; never type it).
VERIFIER_LIMITS = {
    "android-manifest": {"de": "Verhalten der App zur Laufzeit.", "en": "The app's behaviour at run time."},
    "csp": {"de": "Daten, die der Server selbst speichert oder weitergibt.",
            "en": "Data the server itself stores or passes on."},
    "tauri": {"de": "Verbindungen, die der Rust-Code außerhalb des HTTP-Plugins öffnet.",
              "en": "Connections the Rust code opens outside the HTTP plugin."},
    "deps": {"de": "Bibliotheken, die nicht auf der Liste der {n} bekannten Tracker-, Analyse- und "
                   "Werbe-ID-Bibliotheken stehen.",
             "en": "Libraries that are not on the list of {n} known tracker, analytics and advertising-ID libraries."},
}
FIELD_STATE_ORDER = ("shown", "unverified-disclosure", "hidden", "stale")    # a group of facts takes the worst


# ============================================================================= results

@dataclass
class Finding:
    severity: str          # error | warning | info
    code: str
    where: str
    message: str

    def line(self) -> str:
        return f"{self.severity.upper():7} {self.code:6} {self.where}: {self.message}"


@dataclass
class VerifierResult:
    name: str
    target: str
    findings: list[Finding] = field(default_factory=list)
    summary: dict = field(default_factory=dict)

    @property
    def state(self) -> str:
        """D15 vocabulary: failed if any error, otherwise passed (warnings stay listed)."""
        return "failed" if any(f.severity == "error" for f in self.findings) else "passed"


@dataclass
class FactsResult:
    file: str
    facts: dict | None = None
    findings: list[Finding] = field(default_factory=list)
    verifiers: list[VerifierResult] = field(default_factory=list)
    view: dict | None = None
    schema_ok: bool = False
    notes: dict | None = None          # --notes only (section 8.6)

    def all_findings(self) -> list[Finding]:
        return self.findings + [f for v in self.verifiers for f in v.findings]

    def count(self, severity: str) -> int:
        return sum(1 for f in self.all_findings() if f.severity == severity)

    @property
    def ok(self) -> bool:
        return self.count("error") == 0


# ============================================================================= helpers

def load_schema(path: pathlib.Path = SCHEMA_PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_date(s: Any) -> dt.date | None:
    try:
        return dt.date.fromisoformat(s) if isinstance(s, str) and len(s) == 10 else None
    except ValueError:
        return None


def text_of(value: Any, lang: str) -> str:
    """Pick the meta.lang variant of a text value (string or {lang: string})."""
    if isinstance(value, dict):
        return value.get(lang) or next(iter(value.values()), "")
    return value or ""


def all_texts(value: Any) -> list[str]:
    if isinstance(value, dict):
        return [v for v in value.values() if isinstance(v, str)]
    return [value] if isinstance(value, str) else []


def is_text_object(d: Any) -> bool:
    return (isinstance(d, dict) and bool(d) and all(isinstance(k, str) and LANG_KEY_RE.match(k) for k in d)
            and all(isinstance(v, str) for v in d.values()))


def walk_text_objects(node: Any, path: str = "$"):
    if is_text_object(node):
        yield path, node
    elif isinstance(node, dict):
        for k, v in node.items():
            yield from walk_text_objects(v, f"{path}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from walk_text_objects(v, f"{path}[{i}]")


def place_display(p: dict, lang: str) -> str:
    """Normative display form: label, then 'City (CC)' when known, e.g. 'Server · Falkenstein (DE)'; '(CC)' without a
    city; 1.2: the jurisdiction phrase without city and country, e.g. 'Server · Rechtsraum EU'."""
    loc = ""
    if p.get("city") and p.get("country"):
        loc = f"{p['city']} ({p['country']})"
    elif p.get("country"):
        loc = f"({p['country']})"
    elif p.get("jurisdiction"):
        lab = JURISDICTION_LABELS[p["jurisdiction"]]
        loc = lab.get(lang, lab["en"])
    return f"{text_of(p['label'], lang)} · {loc}" if loc else text_of(p["label"], lang)


def location_named(p: dict) -> bool:
    """A place that cloud wording may point at (PL3): city and country, or (1.2, D90) without a city the operator and
    a jurisdiction, or for a server the operator and the country. A third party with a country but no city stays
    unnamed for PL3, as in 1.1."""
    if p.get("city") and p.get("country"):
        return True
    if p.get("city") or not p.get("operator"):
        return False
    return bool(p.get("jurisdiction")) or (p.get("kind") == "server" and bool(p.get("country")))


class Model:
    """Indexed view of a schema-valid facts document."""

    def __init__(self, f: dict):
        self.f = f
        self.lang = f["meta"]["lang"]
        self.places = {p["id"]: p for p in f["places"]}
        self.paths = {p["id"]: p for p in f["paths"]}
        self.checks = {c["id"]: c for c in f["checks"]}

    def place_of(self, pid: str) -> dict | None:
        return self.places.get(pid)

    def is_remote(self, pid: str) -> bool:
        p = self.places.get(pid)
        return bool(p) and p["kind"] in REMOTE_KINDS

    def live_paths(self) -> list[dict]:
        return [p for p in self.f["paths"] if p["trigger"] != "never"]

    def reached_places(self) -> set[str]:
        return {p["to"] for p in self.live_paths()}

    def remote_destinations(self) -> list[tuple[dict, list[dict]]]:
        """Remote places reached by at least one non-never path, with those paths."""
        out = []
        for pid, place in self.places.items():
            if place["kind"] not in REMOTE_KINDS:
                continue
            via = [p for p in self.live_paths() if p["to"] == pid]
            if via:
                out.append((place, via))
        return out

    def declared_hosts(self) -> list[str]:
        return sorted({h for place, _ in self.remote_destinations() for h in place.get("hosts", [])})

    def has_remote_paths(self) -> bool:
        return bool(self.remote_destinations())

    def proofs(self) -> list[tuple[str, dict, bool]]:
        """Every proof-carrying fact: (where, proof, is_disclosure). A disclosure (something leaves, something
        is collected) stays visible when unverified; a reassurance (0, none, never, a named place) is hidden."""
        f = self.f
        out: list[tuple[str, dict, bool]] = []
        out.append(("$.licence", f["licence"]["proof"], False))
        out.append(("$.source", f["source"]["proof"], not f["source"]["open"]))
        for k in COUNTERS:
            if k in f["tracking"]:
                c = f["tracking"][k]
                out.append((f"$.tracking.{k}", c["proof"], c["count"] > 0))
        out.append(("$.accounts", f["accounts"]["proof"], f["accounts"]["mode"] != "none"))
        for i, p in enumerate(f["places"]):
            if "proof" in p:
                out.append((f"$.places[{i}]", p["proof"], False))
        for i, p in enumerate(f["paths"]):
            out.append((f"$.paths[{i}]", p["proof"], p["trigger"] != "never"))
        bk = f.get("backup", {}).get("android")
        if bk:
            cloud = self.paths.get(bk["cloudPath"])
            out.append(("$.backup.android", bk["proof"], bool(cloud) and cloud["trigger"] != "never"))
        out.append(("$.permissions", f["permissions"]["proof"], bool(f["permissions"]["items"])))
        out.append(("$.dependencies", f["dependencies"]["proof"], bool(f["dependencies"]["items"])))
        return out


# ============================================================================= semantic rules

def semantic_findings(f: dict, today: dt.date) -> list[Finding]:
    out: list[Finding] = []

    def add(sev: str, code: str, where: str, msg: str) -> None:
        out.append(Finding(sev, code, where, msg))

    m = Model(f)
    lang = m.lang
    meta, product = f["meta"], f["product"]

    # -- SC3 a newer field in a file that declares an older version (an older checker would fail it as an unknown
    #    key or by an older rule)
    if "label" in f["licence"] and f["schemaVersion"] != "1.3":
        add("warning", "SC3", "$.licence.label",
            'licence.label is a 1.3 field: declare "schemaVersion": "1.3"')
    if f["schemaVersion"] == "1.0":
        for i, c in enumerate(f["checks"]):
            if "limit" in c:
                add("warning", "SC3", f"$.checks[{i}].limit",
                    "'limit' is a 1.1 field: declare \"schemaVersion\": \"1.1\" so a 1.0 checker fails on the version, "
                    "not on an unknown key")
    if f["schemaVersion"] in ("1.0", "1.1"):
        for i, p in enumerate(f["places"]):
            if "jurisdiction" in p:
                add("warning", "SC3", f"$.places[{i}].jurisdiction",
                    "'jurisdiction' is a 1.2 field: declare \"schemaVersion\": \"1.2\" so an older checker fails on "
                    "the version, not on an unknown key")
            elif p["kind"] == "server" and not p.get("city") and p.get("operator") and p.get("country"):
                add("warning", "SC3", f"$.places[{i}]",
                    "a server without a city is valid from 1.2 (PL1, D90): declare \"schemaVersion\": \"1.2\" so an "
                    "older checker fails on the version, not on PL1")

    # -- dates that the schema only checks by pattern
    def date_ok(value: Any, where: str) -> dt.date | None:
        d = parse_date(value)
        if d is None:
            add("error", "SC2", where, f"{value!r} is not a calendar date")
        return d

    # -- LG1 localized text must contain the default language
    for where, obj in walk_text_objects(f):
        if lang not in obj:
            add("error", "LG1", where, f"text object has no '{lang}' entry (meta.lang); renderers fall back to it")

    # -- MD demo marking
    if meta["demo"] and not meta.get("notes"):
        add("error", "MD1", "$.meta", "demo data must say in meta.notes what is invented")
    if not meta["demo"]:
        for c in f["checks"]:
            for i, ev in enumerate(c.get("evidence", [])):
                if ev["ref"].startswith("demo:"):
                    add("error", "MD2", f"$.checks[{c['id']}].evidence[{i}]",
                        "a 'demo:' evidence reference in a file that is not marked demo")
    else:
        add("info", "MD0", "$.meta", "demo data: renderers must show a visible demo marker")

    # -- ID1 unique ids per list
    for key in ("places", "paths", "checks"):
        ids = [x["id"] for x in f[key]]
        dupes = sorted({x for x in ids if ids.count(x) > 1})
        if dupes:
            add("error", "ID1", f"$.{key}", f"duplicate id(s): {dupes}")

    # -- PD product kind requirements
    kind = product["kind"]
    if kind == "android-app":
        if not f.get("backup", {}).get("android"):
            add("error", "PD1", "$.backup.android", "android-app needs backup.android (Android backs up by default)")
        if "android" not in product["platforms"]:
            add("warning", "PD1", "$.product.platforms", "android-app without platform 'android'")
    if kind in WEB_KINDS and "cookies" not in f["tracking"]:
        add("error", "PD1", "$.tracking.cookies", f"{kind} must state its cookie count")
    src = f["source"]
    if src["open"] and not src.get("url"):
        add("error", "PD2", "$.source", "open source needs source.url")
    if not src["open"] and not src.get("reason"):
        add("error", "PD2", "$.source", "closed source needs source.reason")

    # -- FR freshness
    checked_on = date_ok(f["freshness"]["checkedOn"], "$.freshness.checkedOn")
    if checked_on:
        if checked_on > today:
            add("error", "FR2", "$.freshness.checkedOn", f"{checked_on} lies in the future (today {today})")
        age = (today - checked_on).days
        if age > f["freshness"]["maxAgeDays"]:
            sev = "warning" if meta["demo"] else "error"
            add(sev, "FR1", "$.freshness.checkedOn",
                f"stale: checked {age} days ago, maxAgeDays {f['freshness']['maxAgeDays']} — review the facts"
                + (" (demo data: warning only)" if meta["demo"] else ""))

    # -- places
    reached = m.reached_places()
    used = {p["from"] for p in f["paths"]} | {p["to"] for p in f["paths"]}
    for i, p in enumerate(f["places"]):
        w = f"$.places[{i}]"
        pk = p["kind"]
        if pk in REMOTE_KINDS:
            missing = [] if p.get("operator") else ["operator"]
            if p.get("city") and not p.get("country"):
                missing.append("country (a city needs its country)")
            elif not (p.get("country") or p.get("jurisdiction")):
                missing.append("city and country" if pk == "server" else "country")
                missing[-1] += " (or, without a city, country or jurisdiction, 1.2)"
            if missing:
                add("error", "PL1", w, f"{pk} place '{p['id']}' needs {', '.join(missing)} (a named place, never 'the cloud')")
            if pk == "third-party" and p["id"] in reached and not p.get("city"):
                add("warning", "PL2", w, f"third-party place '{p['id']}' names no city; renderers show the country (or jurisdiction) only")
            if p["id"] in reached and "proof" not in p:
                add("error", "PL7", w, f"remote place '{p['id']}' is reached by a path and needs a proof")
        else:
            extra = [k for k in ("operator", "city", "country", "jurisdiction", "hosts") if k in p]
            if extra:
                add("warning", "PL6", w, f"{pk} place '{p['id']}' has {', '.join(extra)}, which mean nothing for a local place")
        if p.get("country") in NOT_A_COUNTRY:
            add("error", "PL4", w, f"'{p['country']}' is not a country; name the country (DE, FI, …), or a legal area "
                                   f"as 'jurisdiction' ({', '.join(JURISDICTIONS)}; 1.2)")
        cloudy = [t for t in all_texts(p["label"]) + (all_texts(p["stores"]["how"]) if "stores" in p else [])
                  if CLOUD_RE.search(t)]
        if cloudy and not location_named(p):
            add("error", "PL3", w, f"'{cloudy[0]}' says cloud without naming city and country (or operator and "
                                   "country or jurisdiction)")
        if pk != "device" and p["id"] not in used:
            add("warning", "PL5", w, f"place '{p['id']}' is not used by any path")
        if "stores" in p:
            out.extend(_retention_findings(p["stores"]["retention"], f"{w}.stores.retention"))

    # -- paths
    for i, p in enumerate(f["paths"]):
        w = f"$.paths[{i}]"
        for end in ("from", "to"):
            if p[end] not in m.places:
                add("error", "PA1", f"{w}.{end}", f"unknown place '{p[end]}': every path must start and end at a declared place")
        if p["from"] == p["to"]:
            add("error", "PA6", w, "a path must move data between two different places (use place.stores for data at rest)")
        live = p["trigger"] != "never"
        if p["trigger"] == "on-user-command" and not p.get("action"):
            add("error", "PA2", w, "on-user-command path needs the label of the UI action that starts it")
        if live:
            for k in ("transport", "retention"):
                if k not in p:
                    add("error", "PA3", w, f"path '{p['id']}' moves data and needs '{k}'")
            if m.is_remote(p["to"]):
                if p.get("transport") == "local":
                    add("error", "PA4", w, "transport 'local' cannot reach a remote place")
                elif p.get("transport") == "none":
                    add("warning", "PA4", w, "unencrypted transport to a remote place; renderers must say so")
        if "retention" in p:
            out.extend(_retention_findings(p["retention"], f"{w}.retention"))
        to = m.place_of(p["to"])
        texts = all_texts(p.get("purpose")) + all_texts(p.get("action")) + all_texts(p.get("retention", {}).get("note"))
        cloudy = [t for t in texts if CLOUD_RE.search(t)]
        if cloudy and to and not location_named(to):
            add("error", "PL3", w, f"'{cloudy[0]}' says cloud, but place '{to['id']}' names no city and country (or "
                                   "operator and country or jurisdiction)")

    # -- tracking counters
    for k in COUNTERS:
        c = f["tracking"].get(k)
        if c is None:
            continue
        w = f"$.tracking.{k}"
        items = c.get("items", [])
        if c["count"] == 0 and not c["proof"]["checks"]:
            add("error", "TR1", w, "0 is a claim: name the check(s) that back it in proof.checks")
        if c["count"] != len(items) and (c["count"] > 0 or items):
            add("error", "TR2", w, f"count {c['count']} but {len(items)} item(s); list every one")

    # -- accounts
    if f["accounts"]["mode"] != "none" and not f["accounts"].get("purpose"):
        add("error", "AC1", "$.accounts", f"accounts '{f['accounts']['mode']}' needs a purpose")

    # -- backup
    bk = f.get("backup", {}).get("android")
    if bk:
        cloud = m.paths.get(bk["cloudPath"])
        if cloud is None:
            add("error", "BK1", "$.backup.android.cloudPath", f"unknown path '{bk['cloudPath']}'")
        else:
            if not m.is_remote(cloud["to"]):
                add("error", "BK1", "$.backup.android.cloudPath", "the backup path must end at a remote place (Google backup)")
            if not bk["allowBackup"] and cloud["trigger"] != "never":
                add("error", "BK2", "$.backup.android", "allowBackup=false but the backup path is not 'never'")
            if bk["allowBackup"] and cloud["trigger"] == "never" and not (
                    bk.get("dataExtractionRules") or bk.get("fullBackupContent")):
                add("error", "BK2", "$.backup.android",
                    "allowBackup=true means Auto Backup runs: set the path to 'automatic' or declare the rules that exclude the data")

    # -- dependencies
    for i, d in enumerate(f["dependencies"]["items"]):
        if "dataPath" in d and d["dataPath"] not in m.paths:
            add("error", "DP6", f"$.dependencies.items[{i}].dataPath", f"unknown path '{d['dataPath']}'")

    # -- checks
    for i, c in enumerate(f["checks"]):
        w = f"$.checks[{i}]"
        st = c["state"]
        d = date_ok(c["date"], f"{w}.date")
        if st == "skipped" and not c.get("reason"):
            add("error", "CK1", w, f"skipped check '{c['id']}' needs a reason (skipped stays visible, with its reason)")
        if st == "failed" and not c.get("reason"):
            add("error", "CK2", w, f"failed check '{c['id']}' needs a reason (what failed)")
        if st in ("passed", "failed") and not c.get("evidence"):
            add("error", "CK3", w, f"{st} check '{c['id']}' needs evidence")
        if "version" in c and c["version"] != product["version"]:
            add("error", "CK4", w, f"check '{c['id']}' ran against {c['version']}, facts are for {product['version']}: re-run it or set it to open")
        if d and d > today:
            add("error", "CK5", w, f"check date {d} lies in the future (today {today})")
        if d and checked_on and d > checked_on:
            add("warning", "FR3", w, f"check '{c['id']}' ({d}) is newer than freshness.checkedOn ({checked_on})")
        if st == "failed":
            add("warning", "CK6", w, f"failed check '{c['id']}' (stays visible): {text_of(c.get('reason', ''), lang)}")
        elif st in ("open", "skipped"):
            add("info", "CK6", w, f"{st} check '{c['id']}'" + (f": {text_of(c['reason'], lang)}" if c.get("reason") else ""))

    # -- proofs
    for where, proof, _disc in m.proofs():
        unknown = [cid for cid in proof["checks"] if cid not in m.checks]
        for cid in unknown:
            add("error", "PR1", f"{where}.proof", f"unknown check '{cid}'")
        known = [m.checks[cid] for cid in proof["checks"] if cid in m.checks]
        if proof["status"] == "verified":
            if not proof["checks"]:
                add("error", "PR2", f"{where}.proof", "verified needs at least one check")
            for c in known:
                if c["state"] != "passed":
                    add("error", "PR3", f"{where}.proof", f"verified, but check '{c['id']}' is {c['state']}")
        elif known and not unknown and all(c["state"] == "passed" for c in known):
            add("info", "PR4", f"{where}.proof", "every listed check passed; the field could be marked verified")
    return out


def _retention_findings(r: dict, where: str) -> list[Finding]:
    out = []
    if r["policy"] == "days" and "days" not in r:
        out.append(Finding("error", "PA5", where, "policy 'days' needs 'days'"))
    if r["policy"] != "days" and "days" in r:
        out.append(Finding("warning", "PA5", where, f"'days' is ignored for policy '{r['policy']}'"))
    if r["policy"] == "processor-terms" and not r.get("note"):
        out.append(Finding("error", "PA5", where, "policy 'processor-terms' needs a note saying whose terms and where"))
    return out


# ============================================================================= render view

def build_view(f: dict, today: dt.date, app_version: str | None = None, app_build: str | None = None) -> dict:
    """The derived values renderers need (FACTS-CONTRACT section 8). Deterministic for a given `today`."""
    m = Model(f)
    reasons = []
    if app_version is not None and app_version != f["product"]["version"]:
        reasons.append(f"version: running {app_version}, facts verified for {f['product']['version']}")
    if app_build is not None and f["product"].get("build") and app_build != f["product"]["build"]:
        reasons.append(f"build: running {app_build}, facts verified for {f['product']['build']}")
    checked_on = parse_date(f["freshness"]["checkedOn"])
    has_remote = m.has_remote_paths()
    if has_remote and checked_on and (today - checked_on).days > f["freshness"]["maxAgeDays"]:
        reasons.append(f"age: checked {checked_on}, older than {f['freshness']['maxAgeDays']} days")
    stale = bool(reasons)

    fields = []
    for where, proof, disclosure in m.proofs():
        if stale:
            state = "stale"
        elif proof["status"] == "verified":
            state = "shown"
        else:
            state = "unverified-disclosure" if disclosure else "hidden"
        fields.append({"where": where, "state": state})

    def level(kinds: tuple[str, ...]) -> str:
        top = max((TRIGGER_RANK[p["trigger"]] for p in m.live_paths()
                   if m.place_of(p["to"]) and m.place_of(p["to"])["kind"] in kinds), default=0)
        return {0: "none", 1: "on-user-command", 2: "automatic"}[top]

    verified_c, unverified_c = set(), set()
    verified_j, unverified_j = set(), set()
    for place, _via in m.remote_destinations():
        ok = place.get("proof", {}).get("status") == "verified"
        if place.get("country"):
            (verified_c if ok else unverified_c).add(place["country"])
        elif place.get("jurisdiction"):
            (verified_j if ok else unverified_j).add(place["jurisdiction"])
    return {
        "demo": f["meta"]["demo"],
        "stale": stale,
        "staleReasons": reasons,
        "network": level(REMOTE_KINDS),
        "userDestinations": level(("user-destination",)),
        "countries": sorted(verified_c),
        "countriesUnverified": sorted(unverified_c - verified_c),
        "outsideEEA": sorted(c for c in verified_c | unverified_c if c not in EEA),
        "jurisdictions": sorted(verified_j),
        "jurisdictionsUnverified": sorted(unverified_j - verified_j),
        "fields": fields,
        "checks": {s: sum(1 for c in f["checks"] if c["state"] == s) for s in CHECK_STATES},
    }


# ============================================================================= notes (--notes, section 8.6)

def _texts(value: Any, lang: str) -> dict | None:
    """A facts text (a string in meta.lang, or {lang: text}) as a {lang: text} object; None stays None."""
    if value is None:
        return None
    return dict(value) if isinstance(value, dict) else {lang: value}


def _fill(template: dict, **kw) -> dict:
    return {k: v.format(**kw) for k, v in template.items()}


def _date_text(iso: str, lang: str) -> str:
    """German DD.MM.YYYY (D22, the section 6.5 example); English and every other language ISO YYYY-MM-DD."""
    d = parse_date(iso)
    if d is None:
        return iso
    return d.strftime("%d.%m.%Y") if lang == "de" else d.isoformat()


def _dated(template: dict, iso: str, **kw) -> dict:
    return {k: v.format(d=_date_text(iso, k), **kw) for k, v in template.items()}


def _limit_label(limit: dict | None) -> dict | None:
    if not limit:
        return None
    return {k: LIMIT_PHRASE.get(k, LIMIT_PHRASE["en"]).format(t=v) for k, v in limit.items()}


def by_kind(c: dict) -> str:
    """Who ran a check: `by` "ci" -> automatic; any other role (maintainer, …) -> manual; no `by` -> unknown."""
    by = (c.get("by") or "").strip().lower()
    if not by:
        return "unknown"
    return "automatic" if by == "ci" else "manual"


def blocklist_counted() -> int:
    """Blocklist entries that count against a tracking counter (declare-path entries are not trackers)."""
    return sum(1 for e in BLOCKLIST if e["category"] in ("tracker", "analytics", "adid"))


def check_limit(c: dict, lang: str) -> tuple[dict | None, str | None]:
    """(limit, source): the check's own `limit` (contract 1.1), else the built-in limit of the verifier it names."""
    if c.get("limit"):
        return _texts(c["limit"], lang), "facts"
    if c.get("verifier") in VERIFIER_LIMITS:
        return _fill(VERIFIER_LIMITS[c["verifier"]], n=blocklist_counted()), "verifier"
    return None, None


def next_due(f: dict) -> str | None:
    """freshness.checkedOn + maxAgeDays: when the whole file must be checked again (FR1, R2). Same on every note."""
    d = parse_date(f["freshness"]["checkedOn"])
    return (d + dt.timedelta(days=f["freshness"]["maxAgeDays"])).isoformat() if d else None


def fact_refs(m: Model) -> list[dict]:
    """Every proof-carrying fact in view order (section 8.4) with its ref name: the JSON path without "$.", and
    places/paths by id instead of index ("places.fsn", "paths.page-request")."""
    out = []
    for where, proof, disclosure in m.proofs():
        mm = re.fullmatch(r"\$\.(places|paths)\[(\d+)\]", where)
        ref = f"{mm.group(1)}.{m.f[mm.group(1)][int(mm.group(2))]['id']}" if mm else where[2:]
        out.append({"ref": ref, "where": where, "proof": proof, "disclosure": disclosure})
    return out


def related_paths(m: Model, refs: list[dict]) -> list[int]:
    """Indexes of the live paths to a remote place that belong in the note of these facts (section 8.6):
    tracking counters -> every live path to a remote place; places.<id> -> the live paths to that place; accounts ->
    live remote paths that carry account data; dependencies -> the live remote paths named by a dependency's dataPath;
    backup.android -> its cloud path when it runs. Licence, source, permissions and paths themselves: none."""
    f = m.f
    live = [i for i, p in enumerate(f["paths"]) if p["trigger"] != "never" and m.is_remote(p["to"])]
    picked: list[int] = []
    for r in refs:
        ref = r["ref"]
        if ref.startswith("tracking."):
            hit = live
        elif ref.startswith("places."):
            hit = [i for i in live if f["paths"][i]["to"] == ref.split(".", 1)[1]]
        elif ref == "accounts":
            hit = [i for i in live if "account" in f["paths"][i]["data"]]
        elif ref == "dependencies":
            named = {d.get("dataPath") for d in f["dependencies"]["items"]}
            hit = [i for i in live if f["paths"][i]["id"] in named]
        elif ref == "backup.android":
            hit = [i for i in live if f["paths"][i]["id"] == f["backup"]["android"]["cloudPath"]]
        else:
            hit = []
        picked += [i for i in hit if i not in picked]
    return sorted(picked)


def _retention_label(r: dict | None, to: dict | None, lang: str) -> dict | None:
    if not r:
        return None
    pol = r["policy"]
    if pol == "days":
        n = r.get("days")
        return {"de": f"{n} {'Tag' if n == 1 else 'Tage'}", "en": f"{n} {'day' if n == 1 else 'days'}"}
    if pol == "processor-terms":
        return _fill(RETENTION_LABELS[pol], o=(to or {}).get("operator") or text_of((to or {}).get("label"), lang))
    return dict(RETENTION_LABELS[pol])


def disclosure_view(m: Model, i: int, states: dict) -> dict:
    """One outflow for a note: the path with its labels (sections 6.1, 6.2, 6.4); an unverified destination shows its
    label with "Ort nicht belegt" instead of city and country (section 8.1)."""
    f, lang = m.f, m.lang
    p = f["paths"][i]
    where = f"$.paths[{i}]"
    pidx = next(j for j, x in enumerate(f["places"]) if x["id"] == p["to"])
    to = f["places"][pidx]
    names = _texts(to["label"], lang)
    if states.get(f"$.places[{pidx}]", "shown") == "shown":
        to_label = {k: place_display(to, k) for k in names}
    else:
        to_label = {k: f"{v} · {PLACE_NOT_VERIFIED_LABEL.get(k, PLACE_NOT_VERIFIED_LABEL['en'])}" for k, v in names.items()}
    r = p.get("retention")
    return {
        "path": p["id"], "where": where, "state": states.get(where), "trigger": p["trigger"], "data": list(p["data"]),
        "to": p["to"], "transport": p.get("transport"), "retention": r["policy"] if r else None,
        "labels": {
            "data": {k: ", ".join(DATA_LABELS[d][k] for d in p["data"]) for k in ("de", "en")},
            "to": to_label,
            "trigger": dict(TRIGGER_LABELS[p["trigger"]]),
            "transport": dict(TRANSPORT_LABELS[p["transport"]]) if p.get("transport") else None,
            "retention": _retention_label(r, to, lang),
            "retentionNote": _texts(r.get("note"), lang) if r else None,
            "purpose": _texts(p.get("purpose"), lang),
            "notVerified": dict(NOT_VERIFIED_LABEL) if states.get(where) == "unverified-disclosure" else None,
        },
    }


def check_note(c: dict, lang: str) -> dict:
    """One check as a note renderer needs it (the check list behind „Wie geprüft?“ and the parts of a note)."""
    limit, source = check_limit(c, lang)
    kind = by_kind(c)
    return {
        "id": c["id"], "state": c["state"], "date": c["date"], "version": c.get("version"), "by": c.get("by"),
        "byKind": kind, "verifier": c.get("verifier"),
        "title": _texts(c["title"], lang), "what": _texts(c["what"], lang), "how": _texts(c["how"], lang),
        "reason": _texts(c.get("reason"), lang), "limit": limit, "limitSource": source,
        "evidence": [dict(e) for e in c.get("evidence", [])],
        "labels": {"state": dict(STATE_LABELS[c["state"]]), "date": _dated(DATE_PHRASES[c["state"]], c["date"]),
                   "by": dict(BY_LABELS[kind]), "limit": _limit_label(limit)},
    }


def build_note(m: Model, view: dict, refs: list[dict], n: int | None = None) -> dict:
    """The note for one claim: one fact, or a group of facts named together (--note). Aggregation (section 8.6):
    state = the worst field state (shown < unverified-disclosure < hidden < stale); result = the worst check state in
    contract order (passed < open < skipped < failed); checkedOn = the oldest date among the checks in that result
    state; by = automatic / manual when every such check agrees, mixed, or unknown when one has no `by`."""
    f, lang = m.f, m.lang
    states = {x["where"]: x["state"] for x in view["fields"]}
    fstates = [states[r["where"]] for r in refs]
    state = max(fstates, key=FIELD_STATE_ORDER.index) if fstates else None
    ids = {cid for r in refs for cid in r["proof"]["checks"]}
    checks = [c for c in f["checks"] if c["id"] in ids]          # execution order; unknown ids are PR1's finding
    result = max((c["state"] for c in checks), key=CHECK_STATES.index) if checks else None
    deciding = [c for c in checks if c["state"] == result]
    checked_on = min(c["date"] for c in deciding) if deciding else None
    pv = f["product"]["version"]
    for_version = pv if deciding and all(c.get("version") == pv for c in deciding) else None
    kinds = {by_kind(c) for c in deciding}
    kind = "unknown" if not kinds or "unknown" in kinds else ("mixed" if len(kinds) > 1 else next(iter(kinds)))
    limits: list[dict] = []
    for c in checks:
        lim, _src = check_limit(c, lang)
        if lim and lim not in limits:
            limits.append(lim)
    due = next_due(f)
    note: dict = {"n": n} if n is not None else {}
    note.update({
        "refs": [r["ref"] for r in refs],
        "where": [r["where"] for r in refs],
        "state": state,
        "disclosure": bool(refs) and all(r["disclosure"] for r in refs),
        "result": result,
        "checks": [c["id"] for c in checks],
        "checkedOn": checked_on,
        "forVersion": for_version,
        "nextDue": due,
        "by": kind,
        "method": [_texts(c["what"], lang) for c in checks],
        "reasons": [{"check": c["id"], "state": c["state"], "text": _texts(c["reason"], lang)}
                    for c in checks if c["state"] in ("skipped", "failed") and c.get("reason")],
        "limits": limits,
        "proofNotes": [_texts(r["proof"]["note"], lang) for r in refs if r["proof"].get("note")],
        "disclosures": [disclosure_view(m, i, states) for i in related_paths(m, refs)],
        "labels": {
            "state": dict(STATE_LABELS[result]) if result else None,
            "checkedOn": _dated(DATE_PHRASES[result], checked_on) if checked_on else None,
            "forVersion": _fill(FOR_VERSION_PHRASE, v=for_version) if for_version else None,
            "nextDue": _dated(NEXT_DUE_PHRASE, due) if due else None,
            "by": dict(BY_LABELS[kind]),
            "limits": [_limit_label(x) for x in limits],
            "notVerified": dict(NOT_VERIFIED_LABEL) if state in ("hidden", "unverified-disclosure") else None,
            "demo": dict(DEMO_LABEL) if f["meta"]["demo"] else None,
        },
    })
    return note


def build_notes(res: FactsResult, groups: list[str] | None = None) -> dict:
    """--notes: per-check data, one note per proof-carrying fact (`claims`, view order) and, with --note, the numbered
    notes 1..n of a page in the given order (`numbered`). Adds NT1 (warning), NT2 (error) and NT3 (info) findings."""
    f = res.facts
    m = Model(f)
    lang = m.lang
    view = res.view
    refs = fact_refs(m)
    lookup = {}
    for r in refs:
        lookup[r["ref"]] = r
        lookup[r["where"]] = r
    fresh = f["freshness"]
    due = next_due(f)
    out: dict = {
        "contract": CONTRACT_VERSION,
        "lang": lang,
        "freshness": {"checkedOn": fresh["checkedOn"], "maxAgeDays": fresh["maxAgeDays"], "nextDue": due},
        "stale": view["stale"],
        "labels": {
            "demo": dict(DEMO_LABEL) if f["meta"]["demo"] else None,
            "stale": _dated(STALE_PHRASE, fresh["checkedOn"], v=f["product"]["version"]),
            "nextDue": _dated(NEXT_DUE_PHRASE, due) if due else None,
        },
        "checks": [check_note(c, lang) for c in f["checks"]],
        "claims": [build_note(m, view, [r]) for r in refs],
    }
    if groups is not None:
        numbered = []
        for n, g in enumerate(groups, 1):
            names = [x.strip() for x in g.split(",") if x.strip()]
            unknown = [x for x in names if x not in lookup]
            for x in unknown:
                res.findings.append(Finding("error", "NT2", f"--note {n}",
                                            f"unknown fact '{x}'; known: {', '.join(r['ref'] for r in refs)}"))
            if not names:
                res.findings.append(Finding("error", "NT2", f"--note {n}", "empty note: name at least one fact"))
            known: list[dict] = []
            for x in names:
                if x in lookup and lookup[x] not in known:
                    known.append(lookup[x])
            note = build_note(m, view, known, n)
            if unknown:
                note["unknown"] = unknown
            numbered.append(note)
        out["numbered"] = numbered
    referenced = {cid for r in refs for cid in r["proof"]["checks"]}
    reassuring = {cid for r in refs if not r["disclosure"] and r["proof"]["status"] == "verified"
                  for cid in r["proof"]["checks"]}
    for i, c in enumerate(f["checks"]):
        if c["id"] in referenced and c["state"] in ("passed", "failed") and by_kind(c) == "unknown":
            res.findings.append(Finding("warning", "NT1", f"$.checks[{i}]",
                                        f"{c['state']} check '{c['id']}' has no 'by': its notes can only say "
                                        "„Eigene Prüfung“, not „automatisch“ or „von Hand“"))
        if c["id"] in reassuring and c["state"] == "passed" and check_limit(c, lang)[0] is None:
            res.findings.append(Finding("info", "NT3", f"$.checks[{i}]",
                                        f"check '{c['id']}' backs a shown reassurance and states no limit: its notes show "
                                        "no „Nicht geprüft: …“; add 'limit' (1.1) unless it covers the whole claim"))
    return out


# ============================================================================= verifier: Android manifest

def _bool_attr(v: str | None) -> bool | None:
    if v is None:
        return None
    return {"true": True, "false": False}.get(v.strip().lower())


def _int_attr(v: str | None) -> int | None:
    try:
        return int(v) if v is not None else None
    except ValueError:
        return None


def _rules_exclusion(section: ET.Element | None) -> tuple[bool, bool]:
    """(core excluded, device-protected storage excluded) for a <cloud-backup>, <device-transfer> or
    <full-backup-content> element. A missing section means that mode is fully enabled (Android docs)."""
    if section is None:
        return False, False
    whole = {e.get("domain") for e in section.findall("exclude") if (e.get("path") or "").strip() in (".", "./", "")}
    core = ("root" in whole or {"file", "database", "sharedpref"} <= whole) and "external" in whole
    device = "device_root" in whole or {"device_file", "device_database", "device_sharedpref"} <= whole
    return core, device


def _load_xml_rules(ref: str, res_dir: pathlib.Path) -> tuple[ET.Element | None, str]:
    m = re.fullmatch(r"@xml/([A-Za-z0-9_]+)", ref or "")
    if not m:
        return None, f"cannot resolve {ref!r} (expected @xml/<name>)"
    p = res_dir / "xml" / f"{m.group(1)}.xml"
    try:
        return ET.parse(p).getroot(), str(p)
    except FileNotFoundError:
        return None, f"rules file not found at {p} (pass --android-res <res dir>)"
    except ET.ParseError as exc:
        return None, f"rules file {p} is not valid XML: {exc}"


def verify_android_manifest(f: dict, manifest: pathlib.Path, res_dir: pathlib.Path | None = None) -> VerifierResult:
    vr = VerifierResult("android-manifest", str(manifest))
    m = Model(f)

    def add(sev, code, msg, where="manifest"):
        vr.findings.append(Finding(sev, code, where, msg))

    try:
        root = ET.parse(manifest).getroot()
    except (OSError, ET.ParseError) as exc:
        add("error", "AM0", f"cannot read {manifest}: {exc}")
        return vr
    if root.tag != "manifest":
        add("error", "AM0", f"root element is <{root.tag}>, expected <manifest>")
        return vr
    res_dir = res_dir or manifest.parent / "res"
    package = root.get("package") or f["product"].get("appId") or ""

    perms, removed, internal = [], [], []
    for tag in ("uses-permission", "uses-permission-sdk-23"):
        for el in root.findall(tag):
            name = el.get(f"{ANDROID_NS}name") or ""
            if el.get(f"{TOOLS_NS}node") == "remove":
                removed.append(name)
            elif "${" in name or (package and name.startswith(package + ".")):
                internal.append(name)
            elif name:
                perms.append(name)
    perms = sorted(set(perms))
    app = root.find("application")
    app_attr = (lambda k: app.get(f"{ANDROID_NS}{k}")) if app is not None else (lambda k: None)
    sdk = root.find("uses-sdk")
    min_sdk = _int_attr(sdk.get(f"{ANDROID_NS}minSdkVersion")) if sdk is not None else None
    target_sdk = _int_attr(sdk.get(f"{ANDROID_NS}targetSdkVersion")) if sdk is not None else None
    raw_allow = app_attr("allowBackup")
    allow = _bool_attr(raw_allow)
    vr.summary = {"permissions": perms, "internet": PERM_INTERNET in perms, "adId": PERM_AD_ID in perms,
                  "allowBackup": raw_allow if raw_allow is not None else "(absent: true)",
                  "dataExtractionRules": app_attr("dataExtractionRules"),
                  "fullBackupContent": app_attr("fullBackupContent"),
                  "minSdk": min_sdk, "targetSdk": target_sdk, "versionName": root.get(f"{ANDROID_NS}versionName"),
                  "ignoredInternal": internal, "removedByTools": removed}
    if internal:
        add("info", "AM4", f"app-internal permission(s) not compared: {internal}")

    # AM7 version
    vname = root.get(f"{ANDROID_NS}versionName")
    if vname and vname != f["product"]["version"]:
        add("error", "AM7", f"versionName {vname} ≠ product.version {f['product']['version']}: facts are stale")
    elif not vname:
        add("info", "AM7", "no versionName in this manifest (source manifest?); version not compared")

    # AM1 network
    remote = [p["id"] for p in m.live_paths() if m.is_remote(p["to"])]
    if PERM_INTERNET in perms and not remote:
        add("error", "AM1", "INTERNET permission present, but the facts declare no path to a server or third party")
    if PERM_INTERNET not in perms and remote:
        add("error", "AM1", f"no INTERNET permission, but the facts declare network path(s) {remote}")

    # AM6 advertising id
    ad = f["tracking"]["adIds"]["count"]
    if PERM_AD_ID in perms and ad == 0:
        add("error", "AM6", f"{PERM_AD_ID} present, but tracking.adIds.count is 0")
    elif PERM_AD_ID not in perms and ad > 0:
        add("warning", "AM6", f"tracking.adIds.count is {ad}, but {PERM_AD_ID} is not requested")

    # AM4 / AM5 permissions
    declared = {p["name"] for p in f["permissions"]["items"]}
    for name in perms:
        if name not in declared:
            add("error", "AM4", f"manifest requests {name}, facts.permissions does not list it")
    for name in sorted(declared):
        android_like = name.startswith("android.permission.") or ".permission." in name
        if android_like and name not in perms:
            add("error", "AM5", f"facts list {name}, the manifest does not request it (stale fact?)")

    # AM2 / AM3 backup
    bk = f.get("backup", {}).get("android")
    if bk is None:
        add("error", "AM2", "facts have no backup.android; Android backs up by default")
        return vr
    if raw_allow is not None and allow is None:
        add("error", "AM2", f"android:allowBackup={raw_allow!r} cannot be evaluated (placeholder?); run against the merged manifest")
        return vr
    effective = True if allow is None else allow
    if effective != bk["allowBackup"]:
        add("error", "AM2", f"effective allowBackup={str(effective).lower()}"
            + (" (attribute absent, Android default)" if allow is None else "")
            + f", facts say {str(bk['allowBackup']).lower()}")
    for key in ("dataExtractionRules", "fullBackupContent"):
        if bk.get(key) and bk[key] != app_attr(key):
            add("error", "AM3", f"facts declare {key}={bk[key]}, manifest has {app_attr(key)!r}")

    cloud = m.paths.get(bk["cloudPath"])
    claims_no_cloud = bool(cloud) and cloud["trigger"] == "never"
    if sdk is None or min_sdk is None or target_sdk is None:
        add("warning", "AM8", "uses-sdk minSdk/targetSdk not found (source manifest?); assuming the worst case for backup rules")
    need_der = target_sdk is None or target_sdk >= 31
    need_fbc = min_sdk is None or min_sdk < 31 or (target_sdk is not None and target_sdk < 31)

    def check_rules(attr: str, section_tag: str | None, what: str) -> None:
        ref = app_attr(attr)
        if not ref:
            add("error", "AM3", f"{what}: android:{attr} is missing, so this mode is fully enabled")
            return
        rules, info = _load_xml_rules(ref, res_dir)
        if rules is None:
            add("error", "AM3", f"{what}: cannot verify — {info}")
            return
        section = rules.find(section_tag) if section_tag else rules
        core, device = _rules_exclusion(section)
        if not core:
            add("error", "AM3", f"{what}: {info} does not exclude every core domain "
                "(root or file+database+sharedpref, plus external, each with path=\".\")")
        elif not device:
            add("warning", "AM3", f"{what}: device-protected storage (device_*) is not excluded; fine only if the app never uses it")

    if effective and claims_no_cloud:
        if need_der:
            check_rules("dataExtractionRules", "cloud-backup", "cloud backup on Android 12+")
        if need_fbc:
            check_rules("fullBackupContent", None, "cloud backup on Android 11 and lower")
    if bk["deviceTransfer"] == "excluded":
        if need_der:
            check_rules("dataExtractionRules", "device-transfer", "device transfer on Android 12+")
        if need_fbc:
            check_rules("fullBackupContent", None, "device transfer on Android 11 and lower")
    return vr


# ============================================================================= verifier: CSP

class _MetaCSP(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.policies: list[str] = []
        self.report_only: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag != "meta":
            return
        a = {k.lower(): (v or "") for k, v in attrs}
        equiv = a.get("http-equiv", "").lower()
        if equiv == "content-security-policy":
            self.policies.append(a.get("content", ""))
        elif equiv == "content-security-policy-report-only":
            self.report_only.append(a.get("content", ""))


def parse_csp(policy: str) -> dict[str, list[str]]:
    out: dict[str, list[str]] = {}
    for part in policy.split(";"):
        toks = part.split()
        if toks and toks[0].lower() not in out:      # first occurrence wins (CSP3)
            out[toks[0].lower()] = toks[1:]
    return out


def classify_source(tok: str) -> tuple[str, str]:
    """-> (kind, value) with kind keyword | local | wildcard | host | unknown."""
    t = tok.strip()
    if t.startswith("'"):
        return "keyword", t.lower()
    if t == "*":
        return "wildcard", "*"
    m = re.fullmatch(r"([A-Za-z][A-Za-z0-9+.-]*):", t)
    if m:
        return ("local", t) if m.group(1).lower() in CSP_LOCAL_SCHEMES else ("wildcard", t)
    m = re.fullmatch(r"(?:([A-Za-z][A-Za-z0-9+.-]*)://)?(\*|\*\.[^/:]+|\[[^\]]+\]|[^/:*]+)(?::(?:\d+|\*))?(?:/.*)?", t)
    if not m:
        return "unknown", t
    scheme, host = (m.group(1) or "").lower(), m.group(2).lower().rstrip(".")
    if scheme in CSP_LOCAL_SCHEMES:
        return "local", t
    if host == "*":
        return "wildcard", t
    if host in CSP_LOCAL_HOSTS or host.endswith(".localhost"):
        return "local", t
    return "host", host


def host_matches(host: str, pattern: str) -> bool:
    """Does `host` (maybe '*.x.de') fall under `pattern` (maybe '*.x.de')?"""
    host, pattern = host.lower(), pattern.lower()
    if host == pattern:
        return True
    return pattern.startswith("*.") and not host.startswith("*.") and host.endswith(pattern[1:])


def _tracker_host(host: str) -> tuple[str, str] | None:
    bare = host[2:] if host.startswith("*.") else host
    for domain, name, cat in TRACKER_HOSTS:
        if bare == domain or bare.endswith("." + domain):
            return name, cat
    return None


def _url_host(url: str) -> str | None:
    m = re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://([^/:?#]+)", url or "")
    return m.group(1).lower() if m else None


def csp_findings(f: dict, policies: list[str], code_prefix: str = "CS", self_is_site: bool = True,
                 where: str = "csp") -> tuple[list[Finding], dict]:
    m = Model(f)
    out: list[Finding] = []
    declared = m.declared_hosts()
    site_host = _url_host(f["product"].get("url", "")) if self_is_site else None

    def add(sev, code, msg):
        x = Finding(sev, f"{code_prefix}{code}", where, msg)
        if x not in out:                       # one finding per cause, not per fallback directive
            out.append(x)

    allowed_hosts: set[str] = set()
    wild_connect = False
    uses_self = False
    undeclared: dict[str, list[str]] = {}
    for policy in policies:
        d = parse_csp(policy)
        directives: dict[str, tuple[list[str], str]] = {}     # effective name -> (sources, where they come from)
        for name in CSP_FETCH:
            if name in d:
                directives[name] = (d[name], name)
            elif "default-src" in d:
                directives[name] = (d["default-src"], "default-src")
            elif name == "connect-src":
                add("error", "2", "neither connect-src nor default-src is set: the page may connect anywhere")
                wild_connect = True
        for name in ("form-action", "report-uri"):
            if name in d:
                directives[name] = (d[name], name)
        for name, (sources, origin) in directives.items():
            label = name if origin == name else f"{name} (via default-src)"
            for tok in sources:
                kind, val = classify_source(tok)
                if kind == "keyword" and val == "'self'":
                    uses_self = True
                elif kind == "wildcard":
                    if name == "connect-src":
                        wild_connect = True
                        add("error", "2", f"{label} allows {val}: destinations cannot be verified")
                    else:
                        add("warning", "2", f"{origin} allows {val}: hosts loaded by it cannot be verified")
                elif kind == "host":
                    allowed_hosts.add(val)
                    if not any(host_matches(val, pat) for pat in declared):
                        undeclared.setdefault(val, []).append(origin)
                    tr = _tracker_host(val)
                    if tr:
                        name_, cat = tr
                        counter = "analytics" if cat == "analytics" else "trackers"
                        if f["tracking"][counter]["count"] == 0:
                            add("error", "4", f"{origin} allows {val} ({name_}), but tracking.{counter}.count is 0")
                elif kind == "unknown":
                    add("warning", "2", f"{origin}: cannot classify source {val!r}")
    for host, names in sorted(undeclared.items()):
        add("error", "1", f"{host} ({', '.join(sorted(set(names)))}) is not a declared destination "
            "(add it to the hosts of a place that a non-never path reaches)")
    if self_is_site and uses_self and f["product"]["kind"] in WEB_KINDS:
        if not site_host:
            add("warning", "6", "'self' is allowed but product.url is not set; the site's own host is not compared")
        elif not any(host_matches(site_host, pat) for pat in declared):
            add("error", "6", f"'self' = {site_host}, which is not in the hosts of any declared server place")
    reachable = set(allowed_hosts) | ({site_host} if (uses_self and site_host) else set())
    for place, _via in m.remote_destinations():
        for h in place.get("hosts", []):
            if not wild_connect and not any(host_matches(h, a) or host_matches(a, h) for a in reachable):
                add("warning", "5", f"declared destination {h} (place '{place['id']}') is not allowed by the CSP: stale fact or CSP too strict")
    summary = {"policies": len(policies), "allowedHosts": sorted(allowed_hosts), "self": uses_self,
               "declaredHosts": declared}
    return out, summary


def load_csp_arg(arg: str) -> tuple[list[str], list[str], str | None]:
    """-> (policies, report_only, error). Accepts an HTML file, a headers file, or a policy string."""
    p = pathlib.Path(arg)
    if p.is_file():
        text = p.read_text(encoding="utf-8", errors="replace")
        if "<" in text:
            parser = _MetaCSP()
            parser.feed(text)
            return parser.policies, parser.report_only, None
        pols = [mm.group(1) for mm in re.finditer(r"(?im)^\s*content-security-policy\s*:\s*(.+)$", text)]
        ro = [mm.group(1) for mm in re.finditer(r"(?im)^\s*content-security-policy-report-only\s*:\s*(.+)$", text)]
        if pols or ro:
            return pols, ro, None
        return ([text.strip()] if re.search(r"[a-z-]+-src\b", text) else []), [], None
    if re.search(r"(default|connect|script|img|style|font)-src\b", arg):
        return [re.sub(r"(?i)^\s*content-security-policy\s*:\s*", "", arg)], [], None
    return [], [], f"{arg!r} is neither a readable file nor a CSP string"


def verify_csp(f: dict, arg: str) -> VerifierResult:
    label = arg if len(arg) <= 80 else arg[:77] + "..."
    vr = VerifierResult("csp", label)
    policies, report_only, err = load_csp_arg(arg)
    if err:
        vr.findings.append(Finding("error", "CS0", "csp", err))
        return vr
    if report_only:
        vr.findings.append(Finding("warning", "CS3", "csp", f"{len(report_only)} report-only policy(ies) ignored: they enforce nothing"))
    if not policies:
        vr.findings.append(Finding("error", "CS3", "csp", "no enforced Content-Security-Policy found: destinations cannot be verified"))
        return vr
    found, vr.summary = csp_findings(f, policies)
    vr.findings.extend(found)
    return vr


# ============================================================================= verifier: Tauri

def _csp_value_to_string(v: Any) -> str | None:
    if v is None:
        return None
    if isinstance(v, str):
        return v
    if isinstance(v, dict):
        return "; ".join(f"{k} {' '.join(val) if isinstance(val, list) else val}" for k, val in v.items())
    return None


def verify_tauri(f: dict, conf_path: pathlib.Path) -> VerifierResult:
    vr = VerifierResult("tauri", str(conf_path))
    m = Model(f)
    declared = m.declared_hosts()

    def add(sev, code, msg, where="tauri"):
        vr.findings.append(Finding(sev, code, where, msg))

    try:
        conf = json.loads(conf_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        add("error", "TA0", f"cannot read {conf_path} as JSON: {exc} (tauri.conf.json5/.toml are not supported)")
        return vr
    v2 = "app" in conf or "identifier" in conf
    base = conf_path.parent

    # TA4 version
    version = conf.get("version") if v2 else conf.get("package", {}).get("version")
    if isinstance(version, str) and version.endswith(".json"):
        try:
            version = json.loads((base / version).read_text(encoding="utf-8")).get("version")
        except (OSError, json.JSONDecodeError) as exc:
            add("warning", "TA4", f"version points to {version}, which cannot be read: {exc}")
            version = None
    if version and version != f["product"]["version"]:
        add("error", "TA4", f"Tauri version {version} ≠ product.version {f['product']['version']}: facts are stale")

    destinations: list[tuple[str, str]] = []      # (url-or-host, where)
    # windows loading remote content
    windows = conf.get("app", {}).get("windows", []) if v2 else conf.get("tauri", {}).get("windows", [])
    for i, w in enumerate(windows or []):
        h = _url_host(w.get("url", "")) if isinstance(w, dict) else None
        if h and not (h in CSP_LOCAL_HOSTS or h.endswith(".localhost")):
            destinations.append((h, f"window[{i}].url"))
    # HTTP scope
    if v2:
        caps: list[Any] = list(conf.get("app", {}).get("security", {}).get("capabilities", []) or [])
        cap_dir = base / "capabilities"
        if cap_dir.is_dir():
            for cf in sorted(cap_dir.iterdir()):
                if cf.suffix == ".json":
                    try:
                        caps.append(json.loads(cf.read_text(encoding="utf-8")))
                    except json.JSONDecodeError as exc:
                        add("error", "TA0", f"capability file {cf.name} is not valid JSON: {exc}")
                elif cf.suffix in (".toml", ".json5"):
                    add("warning", "TA2", f"capability file {cf.name} not parsed (only .json is supported): not verified")
        for cap in caps:
            if not isinstance(cap, dict):
                continue
            for perm in cap.get("permissions", []):
                if isinstance(perm, dict) and str(perm.get("identifier", "")).startswith("http:"):
                    for entry in perm.get("allow", []) or []:
                        url = entry.get("url") if isinstance(entry, dict) else entry
                        destinations.append((str(url), f"capability {cap.get('identifier', '?')} {perm['identifier']}"))
                elif isinstance(perm, str) and perm.startswith("http:"):
                    add("info", "TA2", f"capability {cap.get('identifier', '?')} grants {perm} without a URL scope (no host is allowed by it)")
        updater = conf.get("plugins", {}).get("updater", {}) or {}
        for url in updater.get("endpoints", []) or []:
            destinations.append((url, "plugins.updater.endpoints"))
        csp_raw = conf.get("app", {}).get("security", {}).get("csp")
    else:
        http = conf.get("tauri", {}).get("allowlist", {}).get("http", {}) or {}
        scope = http.get("scope") or []
        if (http.get("all") or http.get("request")) and not scope:
            add("warning", "TA2", "allowlist.http is enabled without a scope: cannot verify")
        for url in scope:
            destinations.append((url, "tauri.allowlist.http.scope"))
        upd = conf.get("tauri", {}).get("updater", {}) or {}
        if upd.get("active"):
            for url in upd.get("endpoints", []) or []:
                destinations.append((url, "tauri.updater.endpoints"))
        csp_raw = conf.get("tauri", {}).get("security", {}).get("csp")

    hosts_seen = []
    for url, where in destinations:
        host = _url_host(url) if "://" in url else url.lower()
        if not host or host in ("*", "**") or host.startswith("*") and "." not in host:
            add("error", "TA2", f"{where} allows {url!r}: any host, destinations cannot be verified")
            continue
        host = re.sub(r"^\*\*\.", "*.", host)
        hosts_seen.append(host)
        if not any(host_matches(host, pat) for pat in declared):
            code = "TA3" if "updater" in where else "TA1"
            add("error", code, f"{where} reaches {host}, which is not a declared destination")

    csp = _csp_value_to_string(csp_raw)
    if csp is None:
        add("error", "TA5", "security.csp is null/absent: the webview may connect anywhere, destinations cannot be verified")
        csp_summary = {}
    else:
        csp_f, csp_summary = csp_findings(f, [csp], code_prefix="CS", self_is_site=False, where="tauri csp")
        # A Tauri CSP only constrains the webview; Rust-side HTTP is covered by the capability scope above.
        vr.findings.extend(x for x in csp_f if x.code != "CS5")
    reach = set(hosts_seen) | set(csp_summary.get("allowedHosts", []))
    for place, _via in m.remote_destinations():
        for h in place.get("hosts", []):
            if not any(host_matches(h, a) or host_matches(a, h) for a in reach):
                add("warning", "TA6", f"declared destination {h} (place '{place['id']}') is reachable neither by the CSP nor an http scope")
    vr.summary = {"configVersion": 2 if v2 else 1, "version": version, "destinations": sorted(set(hosts_seen)),
                  "csp": csp is not None, **({"cspAllowedHosts": csp_summary.get("allowedHosts", [])} if csp_summary else {})}
    return vr


# ============================================================================= verifier: dependencies

_GRADLE_RE = re.compile(r"(?<![\w.@/-])([A-Za-z0-9_][A-Za-z0-9_.\-]*\.[A-Za-z0-9_.\-]+):([A-Za-z0-9_][A-Za-z0-9_.\-]*)")
_NPM_VER_RE = re.compile(r"(?<![\w.@/-])(@[a-z0-9][a-z0-9._~-]*/[a-z0-9][a-z0-9._~-]*|[a-z0-9][a-z0-9._~-]*)@[\^~>=<v]*\d")


def parse_dependencies(path: pathlib.Path) -> tuple[list[tuple[str, bool]], str]:
    """-> ([("eco:name", dev_only)], format). Formats: package-lock.json (v1-v3), package.json, Cargo.lock,
    and any text (Gradle `dependencies` dump, version catalog, yarn.lock, pnpm-lock.yaml) scanned for
    group:artifact and name@version tokens."""
    text = path.read_text(encoding="utf-8", errors="replace")
    found: dict[str, bool] = {}

    def put(coord: str, dev: bool = False) -> None:
        found[coord] = found.get(coord, True) and dev

    if path.suffix == ".json" or text.lstrip().startswith("{"):
        try:
            doc = json.loads(text)
        except json.JSONDecodeError:
            doc = None
        if isinstance(doc, dict) and "lockfileVersion" in doc:
            for key, meta in (doc.get("packages") or {}).items():
                if "node_modules/" in key:
                    put("npm:" + key.rsplit("node_modules/", 1)[1], bool(meta.get("dev")))

            def walk(deps: dict) -> None:
                for name, meta in (deps or {}).items():
                    put("npm:" + name, bool(meta.get("dev")))
                    walk(meta.get("dependencies"))
            walk(doc.get("dependencies") if not doc.get("packages") else {})
            return sorted(found.items()), "package-lock.json"
        if isinstance(doc, dict) and any(k in doc for k in ("dependencies", "devDependencies")):
            for sect in ("dependencies", "optionalDependencies", "peerDependencies"):
                for name in doc.get(sect) or {}:
                    put("npm:" + name)
            for name in doc.get("devDependencies") or {}:
                put("npm:" + name, True)
            return sorted(found.items()), "package.json"
    if path.name == "Cargo.lock" or "[[package]]" in text:
        for mm in re.finditer(r'(?m)^name\s*=\s*"([^"]+)"', text):
            put("cargo:" + mm.group(1))
        return sorted(found.items()), "Cargo.lock"
    for mm in _GRADLE_RE.finditer(text):
        put(f"maven:{mm.group(1)}:{mm.group(2)}")
    for mm in _NPM_VER_RE.finditer(text):
        put("npm:" + mm.group(1))
    return sorted(found.items()), "text"


def verify_deps(f: dict, paths: list[pathlib.Path]) -> VerifierResult:
    vr = VerifierResult("deps", ", ".join(str(p) for p in paths))
    m = Model(f)
    coords: dict[str, bool] = {}
    formats = {}
    for p in paths:
        try:
            items, fmt = parse_dependencies(p)
        except OSError as exc:
            vr.findings.append(Finding("error", "DP0", str(p), f"cannot read: {exc}"))
            continue
        formats[str(p)] = {"format": fmt, "packages": len(items)}
        if not items:
            vr.findings.append(Finding("error", "DP5", str(p), f"no dependency coordinates found ({fmt}): wrong file? nothing was verified"))
        for c, dev in items:
            coords[c] = coords.get(c, True) and dev
    exceptions = {e["package"]: e["reason"] for e in f["dependencies"].get("blocklistExceptions", [])}
    declared_items = f["dependencies"]["items"]
    hits = []
    for entry in BLOCKLIST:
        matched = sorted(c for c in coords if any(fnmatch.fnmatchcase(c, pat) for pat in entry["match"]))
        if not matched:
            continue
        dev_only = all(coords[c] for c in matched)
        names = [c.split(":", 1)[1] for c in matched]
        hits.append({"sdk": entry["name"], "category": entry["category"], "packages": names, "devOnly": dev_only})
        excepted = [n for n in names if n in exceptions]
        if excepted and len(excepted) == len(names):
            vr.findings.append(Finding("warning", "DP4", "deps", f"{entry['name']} ({', '.join(names)}) accepted: {exceptions[excepted[0]]}"))
            continue
        sev = "warning" if dev_only else "error"
        suffix = " (dev-only dependency: not shipped? verify the build)" if dev_only else ""
        if entry["category"] in ("tracker", "analytics", "adid"):
            counter = {"tracker": "trackers", "analytics": "analytics", "adid": "adIds"}[entry["category"]]
            c = f["tracking"][counter]
            if c["count"] == 0:
                vr.findings.append(Finding(sev, "DP1", "deps", f"{entry['name']} found ({', '.join(names)}), but tracking.{counter}.count is 0{suffix}"))
            elif not any(entry["name"].lower() in it.lower() or any(n in it for n in names) for it in c.get("items", [])):
                vr.findings.append(Finding("warning", "DP2", "deps", f"{entry['name']} found, but tracking.{counter}.items does not name it"))
        else:   # declare-path
            ok = [d for d in declared_items
                  if any(fnmatch.fnmatchcase(d["name"], n) or d["name"] == n for n in names)
                  and d.get("dataPath") in m.paths and m.paths[d["dataPath"]]["trigger"] != "never"]
            if not ok:
                vr.findings.append(Finding(sev, "DP3", "deps",
                    f"{entry['name']} found ({', '.join(names)}): not a tracker by default, but it sends data to a third party — "
                    "add it to dependencies.items with a dataPath that names the destination" + suffix))
    vr.summary = {"files": formats, "packages": len(coords), "blocklistHits": hits,
                  "blocklistSize": len(BLOCKLIST)}
    return vr


# ============================================================================= driver

def check_facts_data(f: Any, schema: dict, file_label: str = "<memory>", today: dt.date | None = None,
                     app_version: str | None = None, app_build: str | None = None) -> FactsResult:
    today = today or dt.date.today()
    res = FactsResult(file=file_label, facts=f if isinstance(f, dict) else None)
    errs = CP.validate_schema(f, schema)          # raises CP.UnsupportedSchema -> exit 2 in main()
    res.findings += [Finding("error", "SC1", e.split(":", 1)[0], e.split(":", 1)[1].strip()) for e in errs]
    if errs:
        return res
    res.schema_ok = True
    res.findings += semantic_findings(f, today)
    if app_version is not None and app_version != f["product"]["version"]:
        res.findings.append(Finding("error", "FR4", "$.product.version",
                                    f"facts are for {f['product']['version']}, the build is {app_version}: re-verify"))
    if app_build is not None and f["product"].get("build") and app_build != f["product"]["build"]:
        res.findings.append(Finding("error", "FR4", "$.product.build",
                                    f"facts are for build {f['product']['build']}, the build is {app_build}: re-verify"))
    res.view = build_view(f, today, app_version, app_build)
    return res


def cross_check_verifiers(res: FactsResult, ci: bool) -> None:
    """CK7: a facts check that names a verifier must agree with it; CI1: in --ci mode every passed check
    that names a verifier must have had that verifier run in this invocation."""
    if not res.schema_ok:
        return
    ran: dict[str, VerifierResult] = {}
    for v in res.verifiers:               # several --csp pages: the worst result counts
        if v.name not in ran or v.state == "failed":
            ran[v.name] = v
    for i, c in enumerate(res.facts["checks"]):
        name = c.get("verifier")
        if not name:
            continue
        w = f"$.checks[{i}]"
        if name in ran:
            v = ran[name]
            if c["state"] == "passed" and v.state == "failed":
                res.findings.append(Finding("error", "CK7", w, f"check '{c['id']}' says passed, but verifier {name} failed now"))
            elif c["state"] != "passed" and v.state == "passed":
                res.findings.append(Finding("info", "CK7", w, f"verifier {name} passed; check '{c['id']}' ({c['state']}) could be marked passed with evidence"))
        elif ci and c["state"] == "passed":
            res.findings.append(Finding("error", "CI1", w, f"check '{c['id']}' says passed via verifier {name}, but --{name} was not given (--ci)"))


def check_facts_file(path: pathlib.Path, schema: dict, **kw) -> FactsResult:
    label = str(path)
    try:
        label = str(path.resolve().relative_to(ROOT))
    except ValueError:
        pass
    try:
        f = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        r = FactsResult(file=label)
        r.findings.append(Finding("error", "SC0", "$", "file not found"))
        return r
    except json.JSONDecodeError as exc:
        r = FactsResult(file=label)
        r.findings.append(Finding("error", "SC0", "$", f"invalid JSON: {exc}"))
        return r
    return check_facts_data(f, schema, label, **kw)


# ============================================================================= output

def render_text(res: FactsResult, verbose: bool = False) -> str:
    L: list[str] = []
    f = res.facts if res.schema_ok else None
    head = f"{'PASS' if res.ok else 'FAIL'} {res.file}"
    if f:
        p = f["product"]
        head += f" ({p['id']} {p['version']}{', demo data' if f['meta']['demo'] else ''})"
    head += f": {res.count('error')} error(s), {res.count('warning')} warning(s)"
    L.append(head)
    for x in res.findings:
        if x.severity != "info" or verbose:
            L.append(f"  {x.line()}")
    for v in res.verifiers:
        n_err = sum(1 for x in v.findings if x.severity == "error")
        L.append(f"  verifier {v.name}: {v.state}" + (f" ({n_err} error(s))" if n_err else "") + f" — {v.target}")
        for x in v.findings:
            if x.severity != "info" or verbose:
                L.append(f"    {x.line()}")
    if f:
        lang = f["meta"]["lang"]
        vw = res.view
        counts = " · ".join(f"{vw['checks'][s]} {s}" for s in CHECK_STATES)
        L.append(f"  checks (execution order): {counts}")
        for c in f["checks"]:
            extra = f" — reason: {text_of(c['reason'], lang)}" if c.get("reason") and c["state"] in ("skipped", "failed") else ""
            L.append(f"    [{c['state']:<7}] {c['id']}: {text_of(c['title'], lang)}{extra}")
        hidden = [x["where"] for x in vw["fields"] if x["state"] == "hidden"]
        disc = [x["where"] for x in vw["fields"] if x["state"] == "unverified-disclosure"]
        L.append(f"  view: network {vw['network']} · user destinations {vw['userDestinations']} · countries "
                 f"{', '.join(vw['countries']) or '—'}"
                 + (f" (unverified: {', '.join(vw['countriesUnverified'])})" if vw["countriesUnverified"] else "")
                 + (f" · jurisdictions {', '.join(vw['jurisdictions']) or '—'}"
                    + (f" (unverified: {', '.join(vw['jurisdictionsUnverified'])})" if vw["jurisdictionsUnverified"] else "")
                    if vw["jurisdictions"] or vw["jurisdictionsUnverified"] else "")
                 + f" · stale {'YES: ' + '; '.join(vw['staleReasons']) if vw['stale'] else 'no'}")
        if hidden:
            L.append(f"  hidden (unverified reassurance): {', '.join(hidden)}")
        if disc:
            L.append(f"  shown with 'not verified' marker (disclosure): {', '.join(disc)}")
    return "\n".join(L) + "\n"


def render_json(res: FactsResult) -> dict:
    f = res.facts if res.schema_ok else None
    out = {
        "tool": {"name": "check_facts.py", "version": TOOL_VERSION, "contract": CONTRACT_VERSION},
        "file": res.file,
        "product": ({k: f["product"].get(k) for k in ("id", "name", "kind", "version", "build")} if f else None),
        "demo": f["meta"]["demo"] if f else None,
        "verdict": "pass" if res.ok else "fail",
        "counts": {k: res.count(k) for k in ("error", "warning", "info")},
        "findings": [asdict(x) for x in res.findings],
        "verifiers": [{"name": v.name, "target": v.target, "state": v.state, "summary": v.summary,
                       "findings": [asdict(x) for x in v.findings]} for v in res.verifiers],
        "view": res.view,
    }
    if res.notes is not None:          # --notes only, so the 1.0.0 output shape stays as it was without it
        out["notes"] = res.notes
    return out


def render_blocklist() -> str:
    L = ["Built-in tracker-SDK blocklist (INCOMPLETE; see shared/FACTS-CONTRACT.md section 10):", ""]
    for e in BLOCKLIST:
        L.append(f"  {e['name']:<28} {e['category']:<13} {', '.join(e['match'])}")
    L += ["", "CSP tracker hosts:"]
    for host, name, cat in TRACKER_HOSTS:
        L.append(f"  {host:<28} {cat:<13} {name}")
    return "\n".join(L) + "\n"


# ============================================================================= CLI

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="check_facts.py",
                                 description="Validate sebaroDesign product facts files and verify them against build configuration.")
    ap.add_argument("facts", nargs="*", type=pathlib.Path, help="facts.json file(s)")
    ap.add_argument("--json", action="store_true", help="emit JSON (findings, verifier results, render view)")
    ap.add_argument("--strict", action="store_true", help="warnings also produce exit 1")
    ap.add_argument("--verbose", action="store_true", help="also print info findings")
    ap.add_argument("--today", help="evaluate staleness as of YYYY-MM-DD (default: the system date)")
    ap.add_argument("--app-version", help="version of the build being checked; must equal product.version (FR4)")
    ap.add_argument("--app-build", help="build id of the build being checked; compared with product.build when set")
    ap.add_argument("--android-manifest", type=pathlib.Path, help="AndroidManifest.xml (prefer the merged manifest)")
    ap.add_argument("--android-res", type=pathlib.Path, help="res/ directory for @xml backup rules (default: next to the manifest)")
    ap.add_argument("--csp", action="append", default=[], help="HTML file, headers file, or CSP string (repeatable)")
    ap.add_argument("--tauri", type=pathlib.Path, help="tauri.conf.json (v1 or v2; v2 also reads ./capabilities/*.json)")
    ap.add_argument("--deps", action="append", default=[], type=pathlib.Path,
                    help="dependency listing: Gradle dependencies dump, package-lock.json, package.json, Cargo.lock, yarn/pnpm lock (repeatable)")
    ap.add_argument("--ci", action="store_true", help="every passed check that names a verifier must have it run now (CI1)")
    ap.add_argument("--notes", action="store_true",
                    help="add note data per check and per fact (implies --json; FACTS-CONTRACT section 8.6)")
    ap.add_argument("--note", action="append", metavar="FACTS",
                    help="a numbered note for the comma-separated facts of one claim, e.g. "
                         "tracking.analytics,tracking.adIds,tracking.cookies (repeatable: 1, 2, …; implies --notes; "
                         "exactly one facts file)")
    ap.add_argument("--list-blocklist", action="store_true", help="print the built-in tracker-SDK blocklist and exit")
    ap.add_argument("--schema", type=pathlib.Path, default=SCHEMA_PATH, help=argparse.SUPPRESS)
    ap.add_argument("--version", action="version", version=f"%(prog)s {TOOL_VERSION} (contract {CONTRACT_VERSION})")
    a = ap.parse_args(argv)
    if a.list_blocklist:
        sys.stdout.write(render_blocklist())
        return 0
    if not a.facts:
        ap.error("name at least one facts file")
    verifying = a.android_manifest or a.csp or a.tauri or a.deps
    if (verifying or a.ci or a.app_version or a.app_build or a.note) and len(a.facts) != 1:
        ap.error("verifiers, --ci, --app-version, --app-build and --note need exactly one facts file")
    if a.note:
        a.notes = True
    if a.notes:
        a.json = True
    if a.android_res and not a.android_manifest:
        ap.error("--android-res needs --android-manifest")
    today = None
    if a.today:
        today = parse_date(a.today)
        if today is None:
            ap.error(f"--today {a.today!r} is not YYYY-MM-DD")
    try:
        schema = load_schema(a.schema)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"error: cannot load schema {a.schema}: {exc}", file=sys.stderr)
        return 2

    worst, outputs, json_out = 0, [], []
    for p in a.facts:
        try:
            res = check_facts_file(p, schema, today=today, app_version=a.app_version, app_build=a.app_build)
        except CP.UnsupportedSchema as exc:
            print(f"error: schema/validator mismatch: {exc}", file=sys.stderr)
            return 2
        if res.schema_ok:
            if a.android_manifest:
                res.verifiers.append(verify_android_manifest(res.facts, a.android_manifest, a.android_res))
            for c in a.csp:
                res.verifiers.append(verify_csp(res.facts, c))
            if a.tauri:
                res.verifiers.append(verify_tauri(res.facts, a.tauri))
            if a.deps:
                res.verifiers.append(verify_deps(res.facts, a.deps))
            cross_check_verifiers(res, a.ci)
            if a.notes:
                res.notes = build_notes(res, a.note)
        elif verifying:
            res.findings.append(Finding("error", "SC1", "$", "verifiers did not run because the facts file is invalid"))
        if a.json:
            json_out.append(render_json(res))
        else:
            outputs.append(render_text(res, a.verbose))
        if not res.ok or (a.strict and res.count("warning")):
            worst = 1
    if a.json:
        sys.stdout.write(json.dumps(json_out[0] if len(json_out) == 1 else json_out, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write("".join(outputs))
    return worst


if __name__ == "__main__":
    sys.exit(main())
