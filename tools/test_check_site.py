#!/usr/bin/env python3
"""Self-test of check_site.py's TPLEXP group: python3 tools/test_check_site.py"""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import check_site as cs


class TemplateExports(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.tmp, True)
        src = self.tmp / "docs" / "sebaro"
        src.mkdir(parents=True)
        (src / "tokens.css").write_text("t")
        ios = self.tmp / "templates" / "ios-swiftui" / "SebaroDesign"
        ios.mkdir(parents=True)
        (ios / "sebaro-export.json").write_text(json.dumps({"sebaroDesign": {"commit": "abc1234"}}))
        (self.tmp / "docs" / "GUIDE-SYNC.json").write_text(json.dumps({"sebaroDesignCommit": "abc1234"}))

    def test_same_ios_commit_passes(self):
        self.assertEqual(cs.template_export_findings(self.tmp), ([], []))

    def test_release_copies_are_not_compared(self):
        # the website, web app, desktop and Android starters hold the copy of the public release (a profile), not a
        # mirror of docs/sebaro/; the iOS starter's export is the one setUp wrote
        for rel in (r for r in cs.TEMPLATE_EXPORTS if "ios-swiftui" not in r):
            copy = self.tmp / rel
            copy.mkdir(parents=True)
            (copy / "tokens.css").write_text("release")
        self.assertEqual(cs.template_export_findings(self.tmp), ([], []))

    def test_ios_commit_is_only_a_warning(self):
        (self.tmp / "docs" / "GUIDE-SYNC.json").write_text(json.dumps({"sebaroDesignCommit": "def5678"}))
        errors, warnings = cs.template_export_findings(self.tmp)
        self.assertEqual(errors, [])
        self.assertEqual(len(warnings), 1)
        self.assertIn("templates/ios-swiftui", warnings[0])


class TemplateFiles(unittest.TestCase):
    def test_copies_are_left_out_and_the_starters_own_files_are_scanned(self):
        files = [f.relative_to(cs.ROOT).as_posix() for f in cs.template_files()]
        self.assertIn("templates/android-compose/BLUEPRINT.md", files)
        self.assertEqual([f for f in files if f.startswith(cs.TEMPLATE_EXPORTS)], [])


if __name__ == "__main__":
    unittest.main()
