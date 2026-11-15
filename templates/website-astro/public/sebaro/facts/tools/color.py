#!/usr/bin/env python3
"""sebaroDesign colour science: library + CLI. Python 3.10+, standard library only.

    python3 tools/color.py contrast '#1F7A83' '#FFFFFF'      # WCAG 2.x ratio + APCA Lc
    python3 tools/color.py oklch '#4FB3BF' '#FF0000'         # hex -> OKLCH / OKLab
    python3 tools/color.py gamut 0.70 0.30 150               # OKLCH -> hex (CSS Color 4 gamut mapping)
    python3 tools/color.py deltae '#1F7A83' '#19666E'        # deltaE OK
    python3 tools/color.py cvd '#D32F2F' '#388E3C'           # protan/deutan/tritan simulation
    python3 tools/color.py composite '#00000052' '#FAFAFA'   # alpha over background
    python3 tools/color.py ramp --hue 200 --chroma 0.1       # tonal ramp, steps 50..950
    python3 tools/color.py ramp --hue 200 --chroma 0.1 --tones
Every subcommand accepts --json.

Conventions (see shared/PALETTE-CONTRACT.md, section "Algorithms and constants"):
- Colours are sRGB. Hex input: #RGB, #RGBA, #RRGGBB, #RRGGBBAA (case-insensitive).
  Internally gamma-encoded sRGB channels are floats 0..1 ("rgb"); linear-light channels "lin".
- OKLab/OKLCH: Bjoern Ottosson's linear-sRGB matrices (https://bottosson.github.io/posts/oklab/).
  L is 0..1 (not percent). Hue in degrees 0..360; hue of an achromatic colour is 0.0.
- deltaE OK: Euclidean distance in OKLab, in raw OKLab units (CSS Color 4 "deltaEOK"; its
  just-noticeable difference is 0.02). Note: designSprache/tools/palette-check.py multiplies by
  100; this module does NOT.
- Gamut mapping: CSS Color 4, section 14.2 "Binary Search Gamut Mapping with Local MINDE"
  (JND 0.02, epsilon 0.0001), destination sRGB.
- WCAG 2.x: relative luminance with the 0.04045 linearisation threshold (WCAG 2.2 definition;
  WCAG 2.0 printed 0.03928, which makes no difference for 8-bit values), ratio (L1+.05)/(L2+.05).
- APCA: APCA-W3 0.0.98G-4g constants as in Myndex/apca-w3 v0.1.9 src/apca-w3.js. Signed Lc:
  positive = dark text on light background, negative = light text on dark background.
- CVD: Machado, Oliveira & Fernandes 2009 matrices, severity 1.0, applied in LINEAR RGB,
  result clamped to 0..1.
- Alpha compositing: source-over in gamma-encoded sRGB, which is what browsers and Android
  render by default (an option composites in linear light instead).
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from typing import Iterable, Sequence, Union

__version__ = "1.0.0"

RGB = tuple[float, float, float]
ColorLike = Union[str, Sequence[float]]

# --------------------------------------------------------------------------- parsing

_HEX_RE = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")


def parse_hex(value: str) -> tuple[float, float, float, float]:
    """Parse #RGB/#RGBA/#RRGGBB/#RRGGBBAA -> (r, g, b, a), each 0..1 (gamma-encoded)."""
    if not isinstance(value, str):
        raise ValueError(f"not a hex colour string: {value!r}")
    m = _HEX_RE.match(value.strip())
    if not m:
        raise ValueError(f"not a hex colour: {value!r}")
    h = m.group(1)
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h)
    chans = [int(h[i:i + 2], 16) / 255 for i in range(0, len(h), 2)]
    if len(chans) == 3:
        chans.append(1.0)
    return chans[0], chans[1], chans[2], chans[3]


def hex_to_rgb(value: str) -> RGB:
    """Opaque hex -> (r, g, b). Raises ValueError if the colour carries alpha < 1."""
    r, g, b, a = parse_hex(value)
    if a < 1.0:
        raise ValueError(f"{value!r} has alpha {a:.3f}; composite it over a background first")
    return r, g, b


def has_alpha(value: str) -> bool:
    return parse_hex(value)[3] < 1.0


def _to_byte(c: float) -> int:
    return int(round(min(1.0, max(0.0, c)) * 255))


def rgb_to_hex(rgb: Sequence[float], alpha: float | None = None) -> str:
    """(r, g, b) 0..1 -> '#RRGGBB' (uppercase). Channels are clamped, then rounded.
    With alpha < 1 -> '#RRGGBBAA'."""
    s = "#" + "".join(f"{_to_byte(c):02X}" for c in rgb[:3])
    if alpha is not None and alpha < 1.0:
        s += f"{_to_byte(alpha):02X}"
    return s


def normalize_hex(value: str) -> str:
    """Canonical uppercase '#RRGGBB' or '#RRGGBBAA'."""
    r, g, b, a = parse_hex(value)
    return rgb_to_hex((r, g, b), a if a < 1.0 else None)


def as_rgb(color: ColorLike) -> RGB:
    """Accept an opaque hex string or an (r, g, b) sequence (0..1)."""
    if isinstance(color, str):
        return hex_to_rgb(color)
    if len(color) != 3:
        raise ValueError(f"expected (r, g, b), got {color!r}")
    return float(color[0]), float(color[1]), float(color[2])


# --------------------------------------------------------------------------- transfer

def srgb_to_linear(c: float) -> float:
    """sRGB transfer function, inverse (IEC 61966-2-1, threshold 0.04045). Sign-preserving."""
    a = abs(c)
    lin = a / 12.92 if a <= 0.04045 else ((a + 0.055) / 1.055) ** 2.4
    return math.copysign(lin, c)


def linear_to_srgb(c: float) -> float:
    a = abs(c)
    enc = a * 12.92 if a <= 0.0031308 else 1.055 * a ** (1 / 2.4) - 0.055
    return math.copysign(enc, c)


def rgb_to_linear(rgb: Sequence[float]) -> RGB:
    return tuple(srgb_to_linear(c) for c in rgb[:3])  # type: ignore[return-value]


def linear_to_rgb(lin: Sequence[float]) -> RGB:
    return tuple(linear_to_srgb(c) for c in lin[:3])  # type: ignore[return-value]


# --------------------------------------------------------------------------- OKLab / OKLCH
# Matrices: https://bottosson.github.io/posts/oklab/ (linear sRGB <-> LMS <-> OKLab)

def _cbrt(x: float) -> float:
    return math.copysign(abs(x) ** (1.0 / 3.0), x)


def linear_srgb_to_oklab(lin: Sequence[float]) -> RGB:
    r, g, b = lin[:3]
    l = _cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    m = _cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
    s = _cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def oklab_to_linear_srgb(lab: Sequence[float]) -> RGB:
    L, a, b = lab[:3]
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)


def rgb_to_oklab(color: ColorLike) -> RGB:
    return linear_srgb_to_oklab(rgb_to_linear(as_rgb(color)))


def oklab_to_rgb(lab: Sequence[float]) -> RGB:
    """OKLab -> gamma-encoded sRGB, NOT clamped (may be out of gamut)."""
    return linear_to_rgb(oklab_to_linear_srgb(lab))


ACHROMATIC_EPS = 1e-6  # below this chroma the hue is reported as 0.0


def oklab_to_oklch(lab: Sequence[float]) -> RGB:
    L, a, b = lab[:3]
    c = math.hypot(a, b)
    h = math.degrees(math.atan2(b, a)) % 360.0 if c > ACHROMATIC_EPS else 0.0
    return L, c, h


def oklch_to_oklab(lch: Sequence[float]) -> RGB:
    L, c, h = lch[:3]
    hr = math.radians(h)
    return L, c * math.cos(hr), c * math.sin(hr)


def to_oklch(color: ColorLike) -> RGB:
    """Opaque hex or rgb -> (L 0..1, C, H deg)."""
    return oklab_to_oklch(rgb_to_oklab(color))


def hue_difference(h1: float, h2: float) -> float:
    """Smallest absolute angle between two hues, 0..180."""
    d = abs(h1 - h2) % 360.0
    return 360.0 - d if d > 180.0 else d


# --------------------------------------------------------------------------- gamut mapping

GAMUT_JND = 0.02
GAMUT_EPSILON = 0.0001
_IN_GAMUT_TOL = 1e-6


def in_srgb_gamut(rgb: Sequence[float], tol: float = _IN_GAMUT_TOL) -> bool:
    return all(-tol <= c <= 1.0 + tol for c in rgb[:3])


def _clip(rgb: Sequence[float]) -> RGB:
    return tuple(min(1.0, max(0.0, c)) for c in rgb[:3])  # type: ignore[return-value]


def delta_e_ok_lab(lab1: Sequence[float], lab2: Sequence[float]) -> float:
    return math.dist(lab1[:3], lab2[:3])


def gamut_map_oklch(lch: Sequence[float]) -> RGB:
    """CSS Color 4 section 14.2 (Binary Search Gamut Mapping with Local MINDE) into sRGB.

    Input (L 0..1, C, H). Returns gamma-encoded sRGB inside 0..1. L and H are preserved;
    chroma is reduced until the clipped colour is within JND 0.02 deltaEOK of the
    reduced-chroma colour."""
    L, C, H = float(lch[0]), max(0.0, float(lch[1])), float(lch[2])
    if L >= 1.0:
        return 1.0, 1.0, 1.0
    if L <= 0.0:
        return 0.0, 0.0, 0.0
    origin = oklab_to_rgb(oklch_to_oklab((L, C, H)))
    if in_srgb_gamut(origin):
        return _clip(origin)
    lo, hi, lo_in_gamut = 0.0, C, True
    current = (L, C, H)
    clipped = _clip(origin)
    e = delta_e_ok_lab(rgb_to_oklab(clipped), oklch_to_oklab(current))
    if e < GAMUT_JND:
        return clipped
    while hi - lo > GAMUT_EPSILON:
        chroma = (lo + hi) / 2.0
        current = (L, chroma, H)
        cur_rgb = oklab_to_rgb(oklch_to_oklab(current))
        if lo_in_gamut and in_srgb_gamut(cur_rgb):
            lo = chroma
            continue
        clipped = _clip(cur_rgb)
        e = delta_e_ok_lab(rgb_to_oklab(clipped), oklch_to_oklab(current))
        if e < GAMUT_JND:
            if GAMUT_JND - e < GAMUT_EPSILON:
                return clipped
            lo_in_gamut = False
            lo = chroma
        else:
            hi = chroma
    return clipped


def oklch_to_hex(lch: Sequence[float]) -> str:
    """OKLCH -> '#RRGGBB' via CSS Color 4 gamut mapping (never naive channel clipping)."""
    return rgb_to_hex(gamut_map_oklch(lch))


def max_chroma_in_gamut(L: float, H: float, tol: float = 1e-5) -> float:
    """Largest chroma at (L, H) that lies strictly inside sRGB (binary search, no clipping)."""
    if L <= 0.0 or L >= 1.0:
        return 0.0
    lo, hi = 0.0, 0.5
    while hi - lo > tol:
        mid = (lo + hi) / 2.0
        if in_srgb_gamut(oklab_to_rgb(oklch_to_oklab((L, mid, H)))):
            lo = mid
        else:
            hi = mid
    return lo


# --------------------------------------------------------------------------- WCAG 2.x

def relative_luminance(color: ColorLike) -> float:
    """WCAG 2.2 relative luminance (sRGB, threshold 0.04045, Rec. 709 coefficients)."""
    r, g, b = rgb_to_linear(as_rgb(color))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def wcag_contrast(fg: ColorLike, bg: ColorLike) -> float:
    """WCAG 2.x contrast ratio, 1..21, symmetric. Unrounded: compare this to thresholds,
    never a rounded display value (WCAG does not allow rounding up)."""
    l1, l2 = relative_luminance(fg), relative_luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def format_ratio(ratio: float) -> str:
    """Display a ratio truncated (not rounded) to 2 decimals, so 4.499 shows as 4.49."""
    return f"{math.floor(ratio * 100 + 1e-9) / 100:.2f}"


# --------------------------------------------------------------------------- APCA
# APCA-W3 0.0.98G-4g, constants verbatim from Myndex/apca-w3 v0.1.9 src/apca-w3.js (SA98G).

APCA_VERSION = "APCA-W3 0.0.98G-4g (apca-w3 0.1.9 constants)"
_SA98G = {
    "mainTRC": 2.4,
    "sRco": 0.2126729, "sGco": 0.7151522, "sBco": 0.0721750,
    "normBG": 0.56, "normTXT": 0.57, "revTXT": 0.62, "revBG": 0.65,
    "blkThrs": 0.022, "blkClmp": 1.414,
    "scaleBoW": 1.14, "scaleWoB": 1.14,
    "loBoWoffset": 0.027, "loWoBoffset": 0.027,
    "deltaYmin": 0.0005, "loClip": 0.1,
}


def apca_y(color: ColorLike) -> float:
    """APCA screen luminance estimate Ys (simple 2.4 exponent, no piecewise sRGB curve)."""
    k = _SA98G
    r, g, b = as_rgb(color)
    return (k["sRco"] * r ** k["mainTRC"] + k["sGco"] * g ** k["mainTRC"]
            + k["sBco"] * b ** k["mainTRC"])


def apca_contrast_y(txt_y: float, bg_y: float) -> float:
    """APCAcontrast(txtY, bgY) -> signed Lc (already x100)."""
    k = _SA98G
    if math.isnan(txt_y) or math.isnan(bg_y) or min(txt_y, bg_y) < 0.0 or max(txt_y, bg_y) > 1.1:
        return 0.0
    txt_y = txt_y if txt_y > k["blkThrs"] else txt_y + (k["blkThrs"] - txt_y) ** k["blkClmp"]
    bg_y = bg_y if bg_y > k["blkThrs"] else bg_y + (k["blkThrs"] - bg_y) ** k["blkClmp"]
    if abs(bg_y - txt_y) < k["deltaYmin"]:
        return 0.0
    if bg_y > txt_y:  # normal polarity: dark text on light background
        sapc = (bg_y ** k["normBG"] - txt_y ** k["normTXT"]) * k["scaleBoW"]
        out = 0.0 if sapc < k["loClip"] else sapc - k["loBoWoffset"]
    else:  # reverse polarity: light text on dark background
        sapc = (bg_y ** k["revBG"] - txt_y ** k["revTXT"]) * k["scaleWoB"]
        out = 0.0 if sapc > -k["loClip"] else sapc + k["loWoBoffset"]
    return out * 100.0


def apca_contrast(text: ColorLike, bg: ColorLike) -> float:
    """Signed APCA Lc for `text` on `bg`. NOT symmetric. Advisory only (not normative)."""
    return apca_contrast_y(apca_y(text), apca_y(bg))


# --------------------------------------------------------------------------- deltaE OK

def delta_e_ok(c1: ColorLike, c2: ColorLike) -> float:
    """deltaE OK between two opaque colours, raw OKLab units (JND ~ 0.02)."""
    return delta_e_ok_lab(rgb_to_oklab(c1), rgb_to_oklab(c2))


# --------------------------------------------------------------------------- CVD
# Machado, Oliveira, Fernandes (2009): "A Physiologically-based Model for Simulation of Color
# Vision Deficiency", IEEE TVCG 15(6):1291-1298. Severity 1.0 rows from Table 1 of
# https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html

CVD_MATRICES: dict[str, tuple[RGB, RGB, RGB]] = {
    "protanopia": ((0.152286, 1.052583, -0.204868),
                   (0.114503, 0.786281, 0.099216),
                   (-0.003882, -0.048116, 1.051998)),
    "deuteranopia": ((0.367322, 0.860646, -0.227968),
                     (0.280085, 0.672501, 0.047413),
                     (-0.011820, 0.042940, 0.968881)),
    "tritanopia": ((1.255528, -0.076749, -0.178779),
                   (-0.078411, 0.930809, 0.147602),
                   (0.004733, 0.691367, 0.303900)),
}
CVD_KINDS = tuple(CVD_MATRICES)


def simulate_cvd(color: ColorLike, kind: str) -> RGB:
    """Simulate dichromacy (severity 1.0) in linear RGB; returns gamma-encoded rgb 0..1."""
    if kind not in CVD_MATRICES:
        raise ValueError(f"unknown CVD kind {kind!r}; use one of {', '.join(CVD_KINDS)}")
    lin = rgb_to_linear(as_rgb(color))
    m = CVD_MATRICES[kind]
    out = tuple(min(1.0, max(0.0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]))
                for row in m)
    return linear_to_rgb(out)


def simulate_cvd_hex(color: ColorLike, kind: str) -> str:
    return rgb_to_hex(simulate_cvd(color, kind))


# --------------------------------------------------------------------------- compositing

def composite(fg: str | Sequence[float], bg: ColorLike, alpha: float | None = None,
              linear: bool = False) -> RGB:
    """Source-over: fg (hex with optional alpha, or rgb + `alpha`) over opaque bg.

    Default blends gamma-encoded sRGB values, matching browser/Android rendering.
    `linear=True` blends in linear light (physically correct, NOT what screens render)."""
    if isinstance(fg, str):
        r, g, b, a = parse_hex(fg)
        fg_rgb: RGB = (r, g, b)
        if alpha is not None:
            a = a * alpha
    else:
        fg_rgb = as_rgb(fg)
        a = 1.0 if alpha is None else alpha
    if not 0.0 <= a <= 1.0:
        raise ValueError(f"alpha must be within 0..1, got {a}")
    bg_rgb = as_rgb(bg)
    if linear:
        f, b_ = rgb_to_linear(fg_rgb), rgb_to_linear(bg_rgb)
        return linear_to_rgb(tuple(a * x + (1 - a) * y for x, y in zip(f, b_)))
    return tuple(a * x + (1 - a) * y for x, y in zip(fg_rgb, bg_rgb))  # type: ignore[return-value]


def composite_hex(fg: str, bg: ColorLike, alpha: float | None = None, linear: bool = False) -> str:
    return rgb_to_hex(composite(fg, bg, alpha, linear))


# --------------------------------------------------------------------------- tonal ramps

# Steps 50..950: own lightness curve (OKLCH L), roughly Tailwind-like spacing. A starting
# point for palette drafts, not a finished scale.
STEP_LIGHTNESS: dict[int, float] = {
    50: 0.975, 100: 0.945, 200: 0.895, 300: 0.830, 400: 0.740, 500: 0.650,
    600: 0.560, 700: 0.480, 800: 0.400, 900: 0.330, 950: 0.250,
}
# Tones: tone = round(OKLCH L x 100). Same tone list as Material 3 tonal palettes, but NOTE
# Material's tone is CIELAB L* (HCT), ours is OKLCH L - the numbers are not interchangeable.
DEFAULT_TONES: tuple[int, ...] = (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100)
CHROMA_TAPER = 0.6


def chroma_shape(L: float, taper: float = CHROMA_TAPER) -> float:
    """Relative chroma at lightness L: sin(pi*L)^taper (1 at L=0.5, 0 at both ends)."""
    if L <= 0.0 or L >= 1.0:
        return 0.0
    return math.sin(math.pi * L) ** taper


def _ramp_entry(key: int, L: float, hue: float, peak: float, taper: float) -> dict:
    req = peak * chroma_shape(L, taper)
    rgb = gamut_map_oklch((L, req, hue))
    hx = rgb_to_hex(rgb)
    Lm, Cm, Hm = to_oklch(hx)
    return {
        "key": key, "L": round(L, 4), "C_requested": round(req, 4),
        "C": round(Cm, 4), "H": round(Hm if Cm > 0.002 else hue, 2), "hex": hx,
        "gamut_mapped": req - Cm > 0.002,
        "wcag_vs_white": round(wcag_contrast(hx, "#FFFFFF"), 3),
        "wcag_vs_black": round(wcag_contrast(hx, "#000000"), 3),
        "apca_black_on": round(apca_contrast("#000000", hx), 1),
        "apca_white_on": round(apca_contrast("#FFFFFF", hx), 1),
    }


def tonal_ramp(hue: float, chroma: float, *, tones: Iterable[int] | None = None,
               steps: Iterable[int] | None = None, taper: float = CHROMA_TAPER) -> list[dict]:
    """Generate a gamut-mapped OKLCH ramp for one hue.

    Exactly one of `tones` (0..100, L = tone/100) or `steps` (keys of STEP_LIGHTNESS or
    custom ints mapped via STEP_LIGHTNESS) may be given; default = all steps 50..950.
    Requested chroma = chroma x sin(pi*L)^taper; then CSS Color 4 gamut mapping."""
    if tones is not None and steps is not None:
        raise ValueError("give either tones or steps, not both")
    if chroma < 0:
        raise ValueError("chroma must be >= 0")
    hue = hue % 360.0
    out = []
    if tones is not None:
        for t in tones:
            if not 0 <= t <= 100:
                raise ValueError(f"tone {t} outside 0..100")
            out.append(_ramp_entry(int(t), t / 100.0, hue, chroma, taper))
    else:
        keys = list(steps) if steps is not None else list(STEP_LIGHTNESS)
        for k in keys:
            if k not in STEP_LIGHTNESS:
                raise ValueError(f"unknown step {k}; known: {sorted(STEP_LIGHTNESS)}")
            out.append(_ramp_entry(int(k), STEP_LIGHTNESS[k], hue, chroma, taper))
    return out


# --------------------------------------------------------------------------- reporting helpers

def describe(color: ColorLike) -> dict:
    rgb = as_rgb(color)
    L, a, b = rgb_to_oklab(rgb)
    _, C, H = oklab_to_oklch((L, a, b))
    return {
        "hex": rgb_to_hex(rgb),
        "oklch": {"L": round(L, 4), "C": round(C, 4), "H": round(H, 2)},
        "oklab": {"L": round(L, 4), "a": round(a, 4), "b": round(b, 4)},
        "css": f"oklch({L * 100:.2f}% {C:.4f} {H:.2f})",
        "relative_luminance": round(relative_luminance(rgb), 5),
    }


def contrast_report(fg: str, bg: str) -> dict:
    """fg may carry alpha (composited over bg first)."""
    fg_eff = composite_hex(fg, bg) if has_alpha(fg) else normalize_hex(fg)
    bg_n = normalize_hex(bg)
    ratio = wcag_contrast(fg_eff, bg_n)
    return {
        "fg": normalize_hex(fg), "fg_effective": fg_eff, "bg": bg_n,
        "wcag": round(ratio, 4), "wcag_display": format_ratio(ratio),
        "apca_lc": round(apca_contrast(fg_eff, bg_n), 2),
        "passes": {
            "AA_text_4.5": ratio >= 4.5, "AA_large_text_3": ratio >= 3.0,
            "AA_non_text_3": ratio >= 3.0, "AAA_text_7": ratio >= 7.0,
            "AAA_large_text_4.5": ratio >= 4.5,
        },
        "delta_e_ok": round(delta_e_ok(fg_eff, bg_n), 4),
    }


# --------------------------------------------------------------------------- CLI

def _parse_int_list(s: str) -> list[int]:
    try:
        return [int(x) for x in s.split(",") if x.strip()]
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"expected comma-separated integers: {s!r}") from exc


def _emit(obj, as_json: bool, text: str) -> None:
    print(json.dumps(obj, indent=2, ensure_ascii=False) if as_json else text)


def _cmd_contrast(a) -> int:
    r = contrast_report(a.fg, a.bg)
    p = r["passes"]
    yes = lambda b: "pass" if b else "FAIL"
    lines = [
        f"fg {r['fg']}" + (f" (composited: {r['fg_effective']})" if r["fg"] != r["fg_effective"] else "")
        + f"  on  bg {r['bg']}",
        f"WCAG 2.x   {r['wcag_display']}:1  (exact {r['wcag']})",
        f"  AA text >=4.5 {yes(p['AA_text_4.5'])} | AA large/non-text >=3 {yes(p['AA_large_text_3'])}"
        f" | AAA text >=7 {yes(p['AAA_text_7'])}",
        f"APCA Lc    {r['apca_lc']:+.1f}  ({APCA_VERSION}; advisory, not normative)",
        f"deltaE OK  {r['delta_e_ok']:.4f}",
    ]
    _emit(r, a.json, "\n".join(lines))
    return 0


def _cmd_apca(a) -> int:
    lc = apca_contrast(a.text, a.bg)
    _emit({"text": normalize_hex(a.text), "bg": normalize_hex(a.bg), "apca_lc": round(lc, 4),
           "version": APCA_VERSION}, a.json, f"APCA Lc {lc:+.2f}  (text {a.text} on bg {a.bg})")
    return 0


def _cmd_oklch(a) -> int:
    rows = [describe(c) for c in a.colors]
    text = "\n".join(
        f"{d['hex']}  L {d['oklch']['L']:.4f}  C {d['oklch']['C']:.4f}  H {d['oklch']['H']:7.2f}"
        f"   {d['css']}   Y {d['relative_luminance']:.4f}" for d in rows)
    _emit(rows if len(rows) > 1 else rows[0], a.json, text)
    return 0


def _cmd_gamut(a) -> int:
    L = a.L / 100.0 if a.L > 1.0 else a.L
    raw = oklab_to_rgb(oklch_to_oklab((L, a.C, a.H)))
    hx = oklch_to_hex((L, a.C, a.H))
    d = describe(hx)
    r = {"requested": {"L": L, "C": a.C, "H": a.H}, "in_gamut": in_srgb_gamut(raw),
         "hex": hx, "result_oklch": d["oklch"],
         "max_chroma_at_L_H": round(max_chroma_in_gamut(L, a.H), 4)}
    text = (f"oklch({L:.4f} {a.C:.4f} {a.H:.2f}) -> {hx}"
            f"  ({'in gamut' if r['in_gamut'] else 'gamut-mapped'}; result C {d['oklch']['C']:.4f},"
            f" sRGB max C at this L/H {r['max_chroma_at_L_H']:.4f})")
    _emit(r, a.json, text)
    return 0


def _cmd_deltae(a) -> int:
    d = delta_e_ok(a.a, a.b)
    _emit({"a": normalize_hex(a.a), "b": normalize_hex(a.b), "delta_e_ok": round(d, 5)}, a.json,
          f"deltaE OK {d:.4f}  (JND 0.02; x100 = {d * 100:.2f})")
    return 0


def _cmd_cvd(a) -> int:
    kinds = CVD_KINDS if a.kind == "all" else (a.kind,)
    rows = []
    for c in a.colors:
        row = {"hex": normalize_hex(c)}
        for k in kinds:
            row[k] = simulate_cvd_hex(c, k)
        rows.append(row)
    text = "\n".join("  ".join([r["hex"]] + [f"{k[:5]} {r[k]}" for k in kinds]) for r in rows)
    if len(a.colors) > 1:
        pairs = []
        for i in range(len(a.colors)):
            for j in range(i + 1, len(a.colors)):
                ci, cj = rows[i]["hex"], rows[j]["hex"]
                entry = {"pair": [ci, cj], "normal": round(delta_e_ok(ci, cj), 4)}
                for k in kinds:
                    entry[k] = round(delta_e_ok(rows[i][k], rows[j][k]), 4)
                pairs.append(entry)
        text += "\n\npairwise deltaE OK (normal / " + " / ".join(kinds) + "):\n" + "\n".join(
            f"  {p['pair'][0]} {p['pair'][1]}  " + "  ".join(f"{p[k]:.4f}" for k in ("normal",) + kinds)
            for p in pairs)
        out = {"colors": rows, "pairs": pairs}
    else:
        out = rows[0]
    _emit(out, a.json, text)
    return 0


def _cmd_composite(a) -> int:
    rgb = composite(a.fg, a.bg, alpha=a.alpha, linear=a.linear)
    hx = rgb_to_hex(rgb)
    _emit({"fg": a.fg, "bg": normalize_hex(a.bg), "alpha": a.alpha, "linear": a.linear, "hex": hx},
          a.json, hx)
    return 0


def _cmd_ramp(a) -> int:
    if a.tones is not None:
        rows = tonal_ramp(a.hue, a.chroma, tones=a.tones or DEFAULT_TONES, taper=a.taper)
        head = "tone"
    else:
        rows = tonal_ramp(a.hue, a.chroma, steps=a.steps, taper=a.taper)
        head = "step"
    lines = [f"ramp hue {a.hue % 360:.1f}  peak chroma {a.chroma:.3f}  taper {a.taper}"
             f"  (OKLCH, CSS Color 4 gamut mapping)",
             f"{head:>5}  hex      L      C_req  C      H       vsW    vsB    Lc(blk) Lc(wht)"]
    for r in rows:
        lines.append(
            f"{r['key']:>5}  {r['hex']}  {r['L']:.3f}  {r['C_requested']:.3f}  {r['C']:.3f}"
            f"{'*' if r['gamut_mapped'] else ' '} {r['H']:6.1f}  {format_ratio(r['wcag_vs_white']):>5}"
            f"  {format_ratio(r['wcag_vs_black']):>5}  {r['apca_black_on']:+6.1f}  {r['apca_white_on']:+6.1f}")
    lines.append("* = chroma reduced by gamut mapping. vsW/vsB = WCAG ratio against #FFFFFF/#000000.")
    _emit(rows, a.json, "\n".join(lines))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="color.py", description=__doc__.split("\n\n")[0])
    p.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    sub = p.add_subparsers(dest="cmd", required=True)

    def add(name, fn, help_):
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("--json", action="store_true", help="machine-readable output")
        sp.set_defaults(fn=fn)
        return sp

    sp = add("contrast", _cmd_contrast, "WCAG 2.x ratio + APCA Lc for fg on bg")
    sp.add_argument("fg", help="foreground hex (alpha allowed: composited over bg)")
    sp.add_argument("bg", help="opaque background hex")
    sp = add("apca", _cmd_apca, "signed APCA Lc for text on bg")
    sp.add_argument("text")
    sp.add_argument("bg")
    sp = add("oklch", _cmd_oklch, "hex -> OKLCH/OKLab")
    sp.add_argument("colors", nargs="+")
    sp = add("gamut", _cmd_gamut, "OKLCH -> hex with CSS Color 4 gamut mapping")
    sp.add_argument("L", type=float, help="lightness 0..1 (values > 1 are read as percent)")
    sp.add_argument("C", type=float, help="chroma")
    sp.add_argument("H", type=float, help="hue in degrees")
    sp = add("deltae", _cmd_deltae, "deltaE OK between two colours")
    sp.add_argument("a")
    sp.add_argument("b")
    sp = add("cvd", _cmd_cvd, "simulate protanopia/deuteranopia/tritanopia (Machado 2009, sev. 1.0)")
    sp.add_argument("colors", nargs="+")
    sp.add_argument("--kind", default="all", choices=("all",) + CVD_KINDS)
    sp = add("composite", _cmd_composite, "alpha-composite fg over opaque bg")
    sp.add_argument("fg", help="hex, may be #RRGGBBAA")
    sp.add_argument("bg")
    sp.add_argument("--alpha", type=float, default=None, help="extra alpha multiplier 0..1")
    sp.add_argument("--linear", action="store_true", help="blend in linear light instead of sRGB")
    sp = add("ramp", _cmd_ramp, "tonal ramp in OKLCH for one hue")
    sp.add_argument("--hue", type=float, required=True)
    sp.add_argument("--chroma", type=float, required=True, help="peak chroma, e.g. 0.10")
    g = sp.add_mutually_exclusive_group()
    g.add_argument("--tones", nargs="?", const=[], type=_parse_int_list, default=None,
                   help="tones 0..100 (L = tone/100); optional comma list, default "
                        + ",".join(map(str, DEFAULT_TONES)))
    g.add_argument("--steps", type=_parse_int_list, default=None,
                   help="comma list of steps from 50..950 (default all)")
    sp.add_argument("--taper", type=float, default=CHROMA_TAPER,
                    help=f"chroma taper exponent (default {CHROMA_TAPER})")
    return p


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.fn(args)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
