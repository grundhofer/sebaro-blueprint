#!/usr/bin/env python3
"""Self-test of check_site.py's helpers: python3 tools/test_check_site.py"""
import struct
import sys
import unittest
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_site as cs


def png(width, height, rows, colour_type=2):
    """A PNG of 8-bit rows, each row given with its filter byte."""
    def chunk(kind, body):
        return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))
    head = struct.pack(">IIBBBBB", width, height, 8, colour_type, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", head) + chunk(b"IDAT", zlib.compress(b"".join(rows))) + chunk(b"IEND", b"")


class DontSpecimen(unittest.TestCase):
    """CSS and STYLE let a colour literal pass only inside a „Nicht so“ specimen."""

    def exempt(self, css):
        return cs.dont_exempt(cs.css_blocks(css), css.index("#"))

    def test_only_the_inside_of_a_specimen_is_exempt(self):
        self.assertTrue(self.exempt(".g-ex--dont .x { color: #f00 }"))
        self.assertTrue(self.exempt("@media (min-width: 1px) { .g-ex--dont .x { color: #f00 } }"))
        self.assertFalse(self.exempt(".x { color: #f00 }"))
        self.assertFalse(self.exempt(".g-ex--dont .x, .y { color: #f00 }"))
        self.assertFalse(self.exempt(".g-ex--dont .g-ex__label { color: #f00 }"))

    def test_inline_style(self):
        page = cs.Page()
        page.feed('<div class="g-ex--dont"><p style="color: #f00">a</p><p class="g-ex__note" style="color: #0f0">b</p>'
                  '</div><p style="color: #00f">c</p>')
        self.assertEqual(page.dont_styles, 1)
        self.assertEqual(page.styles, ["color: #0f0", "color: #00f"])


class ShareImage(unittest.TestCase):
    """OG reads size, colour type and the most frequent colour of a PNG."""

    def test_ground_of_an_rgb_image(self):
        white, red = b"\xff\xff\xff", b"\xff\x00\x00"
        data = png(3, 2, [b"\x00" + white + white + red, b"\x02" + bytes(9)])   # second row: filter Up, the same pixels
        width, height, depth, colour_type, kinds, idat = cs.png_info(data)
        self.assertEqual((width, height, depth, colour_type, "tRNS" in kinds), (3, 2, 8, 2, False))
        self.assertEqual(cs.png_ground(width, height, zlib.decompress(idat)), (white, 4 / 6))
        data = png(2, 1, [b"\x01" + white + bytes(3)])                  # filter Sub: two white pixels
        width, height, *_rest, idat = cs.png_info(data)
        self.assertEqual(cs.png_ground(width, height, zlib.decompress(idat)), (white, 1.0))

    def test_not_a_png(self):
        with self.assertRaises(ValueError):
            cs.png_info(b"GIF89a")


if __name__ == "__main__":
    unittest.main()
