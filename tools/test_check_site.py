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
        # the website, web app and desktop starters hold the copy of the public release (a profile), not a mirror of
        # docs/sebaro/
        for rel in cs.TEMPLATE_EXPORTS[:-1]:
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


if __name__ == "__main__":
    unittest.main()
