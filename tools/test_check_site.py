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
        (src / "css").mkdir(parents=True)
        (src / "css" / "a.css").write_text("a{}")
        (src / "tokens.css").write_text("t")
        for rel in cs.TEMPLATE_EXPORTS[:3]:
            shutil.copytree(src, self.tmp / rel)
        ios = self.tmp / "templates" / "ios-swiftui" / "SebaroDesign"
        ios.mkdir(parents=True)
        (ios / "sebaro-export.json").write_text(json.dumps({"sebaroDesign": {"commit": "abc1234"}}))
        (self.tmp / "docs" / "GUIDE-SYNC.json").write_text(json.dumps({"sebaroDesignCommit": "abc1234"}))

    def test_current_copies_pass(self):
        self.assertEqual(cs.template_export_findings(self.tmp), ([], []))

    def test_stale_file_fails(self):
        (self.tmp / cs.TEMPLATE_EXPORTS[1] / "tokens.css").write_text("old")
        errors, _ = cs.template_export_findings(self.tmp)
        self.assertEqual(len(errors), 1)
        self.assertIn("templates/webapp-vite", errors[0])
        self.assertIn("differs: tokens.css", errors[0])
        self.assertIn("npm run sebaro:sync", errors[0])

    def test_missing_and_extra_files_fail(self):
        (self.tmp / cs.TEMPLATE_EXPORTS[0] / "css" / "a.css").unlink()
        (self.tmp / cs.TEMPLATE_EXPORTS[2] / "new.js").write_text("x")
        errors, _ = cs.template_export_findings(self.tmp)
        self.assertEqual(len(errors), 2)
        self.assertIn("missing: css/a.css", errors[0])
        self.assertIn("extra: new.js", errors[1])

    def test_dotfile_ignored(self):
        (self.tmp / cs.TEMPLATE_EXPORTS[0] / ".DS_Store").write_text("x")
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
