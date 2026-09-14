"""Focused tests for public-only output, metadata, and cloud-config boundaries."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

from engine import public_build


class PublicBuildTests(unittest.TestCase):
    def fixture(self, root):
        (root / "packs" / "course").mkdir(parents=True)
        (root / "core").mkdir()
        (root / "engine").mkdir()
        (root / "core" / "library.js").write_text("window.PREP_CORE = {};", encoding="utf-8")
        (root / "packs" / "course" / "content.js").write_text(
            "window.PREP_CONTENT = {meta:{id:'course',title:'Public course'},topics:[],groups:[]};",
            encoding="utf-8")
        (root / "packs" / "another-pack").mkdir()
        (root / "packs" / "another-pack" / "content.js").write_text("not read", encoding="utf-8")
        output = root / "public-dist"

        def build_command(args):
            out = Path(args[args.index("--out") + 1])
            out.write_text('<!doctype html><html><head><title>Public course</title></head><body><script></script></body></html>', encoding="utf-8")

        return output, build_command

    def test_build_contains_only_allowlisted_public_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            config_path = root / "public-config.json"
            wrapper = {"enabled": True, "firebase": {
                "apiKey": "public-key", "authDomain": "example.firebaseapp.com",
                "projectId": "course-project", "appId": "web-app",
                "messagingSenderId": "123456",
            }}
            config_path.write_text(json.dumps(wrapper), encoding="utf-8")
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                public_build.build_public(root=root, output_dir=output,
                                          cloud_config_path=config_path)
            self.assertEqual(set(p.name for p in output.iterdir()), public_build.PUBLIC_FILES)
            self.assertEqual(Path(call.call_args.args[0][2]), root / "packs" / "course")
            course = (output / "course.html").read_text(encoding="utf-8")
            index = (output / "index.html").read_text(encoding="utf-8")
            self.assertIn('<title>Interview preparation course</title>', course)
            self.assertIn('<title>Interview preparation course | Roadmap</title>', index)
            self.assertIn('<meta name="viewport" content="width=device-width,initial-scale=1">', course)
            self.assertEqual(index.count('name="viewport"'), 1)
            self.assertIn('rel="canonical" href="https://ylnhari.github.io/interview-prep/course.html"', course)
            self.assertIn("window.PREP_CLOUD_CONFIG=" + json.dumps(wrapper, separators=(",", ":")), course)
            self.assertIn("window.PREP_CLOUD_CONFIG=" + json.dumps(wrapper, separators=(",", ":")), index)
            self.assertNotEqual(course.split('name="description" content="', 1)[1].split('"', 1)[0],
                                index.split('name="description" content="', 1)[1].split('"', 1)[0])
            self.assertNotIn("another-pack", "".join(p.read_text(encoding="utf-8") for p in output.iterdir()))
            self.assertEqual((output / "robots.txt").read_text(encoding="ascii"),
                             "User-agent: *\nAllow: /\nSitemap: https://ylnhari.github.io/interview-prep/sitemap.xml\n")

    def test_unexpected_output_is_rejected_before_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            output.mkdir()
            (output / "unexpected.html").write_text("private", encoding="utf-8")
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                with self.assertRaisesRegex(ValueError, "unexpected files"):
                    public_build.build_public(root=root, output_dir=output)
            call.assert_not_called()

    def test_output_path_symlink_is_rejected_before_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            target = root / "docs"
            target.mkdir()
            try:
                output.symlink_to(target, target_is_directory=True)
            except OSError as exc:
                self.skipTest("symlink creation unavailable: " + str(exc))
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                with self.assertRaisesRegex(ValueError, "symlink or reparse point"):
                    public_build.build_public(root=root, output_dir=output)
            call.assert_not_called()

    def test_symlinked_allowlisted_output_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, _ = self.fixture(root)
            output.mkdir()
            target = root / "not-public.txt"
            target.write_text("not for publication", encoding="utf-8")
            try:
                (output / "index.html").symlink_to(target)
            except OSError as exc:
                self.skipTest("symlink creation unavailable: " + str(exc))
            with self.assertRaisesRegex(ValueError, "symlink or reparse point"):
                public_build.output_names(output)

    def test_reparse_output_path_is_rejected_before_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            with mock.patch.object(public_build, "is_reparse_point",
                                   side_effect=lambda path: Path(path) == output):
                with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                    with self.assertRaisesRegex(ValueError, "symlink or reparse point"):
                        public_build.build_public(root=root, output_dir=output)
            call.assert_not_called()

    def test_cloud_config_is_allowlisted_and_script_safe(self):
        safe = {"enabled": True, "firebase": {"apiKey": "public-key", "authDomain": "example.test",
                                                "projectId": "course-project", "appId": "web-app"}}
        html = public_build.add_metadata("<title>x</title><script></script>", title="x",
                                         canonical="https://example.test/", cloud_config=safe)
        self.assertIn('window.PREP_CLOUD_CONFIG={"enabled":true,"firebase":{"apiKey":"public-key","authDomain":"example.test","projectId":"course-project","appId":"web-app"}}', html)
        self.assertNotIn("</script>\"", html)
        with tempfile.TemporaryDirectory() as tmp:
            for invalid in (
                {"enabled": True, "firebase": {"apiKey": "k", "authDomain": "a", "projectId": "p", "appId": "i", "ownerUid": "private"}},
                {"enabled": True, "firebase": {"apiKey": "k", "authDomain": "a", "projectId": "p", "appId": "i", "storageBucket": "unused"}},
                {"enabled": True, "firebase": {"apiKey": "k", "authDomain": "a", "projectId": "p", "appId": "i", "measurementId": "unused"}},
                {"enabled": True, "firebase": {"apiKey": "k", "authDomain": "a", "projectId": "p", "appId": "i", "apiSecret": "private"}},
                {"enabled": True, "firebase": {"apiKey": "k", "authDomain": "a", "projectId": "p", "appId": "i", "ownerEmail": "private@example.test"}},
                {"apiKey": "flat-config-is-not-supported"},
            ):
                config = Path(tmp) / "config.json"
                config.write_text(json.dumps(invalid), encoding="utf-8")
                with self.assertRaises(ValueError):
                    public_build.parse_config(config)


if __name__ == "__main__":
    unittest.main()
