"""Focused tests for public-only output, metadata, and guest-only progress boundaries."""
import contextlib
import io
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
        (root / "engine" / "public-progress.js").write_text(
            "window.PREP_PUBLIC_PROGRESS = { create: function () { return { enabled: false }; } };",
            encoding="utf-8")
        (root / "engine" / "cloud-progress.js").write_text(
            "window.PREP_CLOUD = { create: function () { return { enabled: false }; } };",
            encoding="utf-8")
        (root / "core" / "library.js").write_text("window.PREP_CORE = {};", encoding="utf-8")
        (root / "packs" / "course" / "content.js").write_text(
            "window.PREP_CONTENT = {meta:{id:'course',title:'Public course'},topics:[],groups:[]};",
            encoding="utf-8")
        (root / "packs" / "another-pack").mkdir()
        (root / "packs" / "another-pack" / "content.js").write_text("not read", encoding="utf-8")
        output = root / "public-dist"

        def build_command(args):
            out = Path(args[args.index("--out") + 1])
            owner = (root / "engine" / "cloud-progress.js").read_text(encoding="utf-8")
            out.write_text('<!doctype html><html><head><title>Public course</title></head><body><script>\n' + owner + '\n</script><script>/*__PUBLIC_PROGRESS__*/</script></body></html>', encoding="utf-8")

        return output, build_command

    def test_build_contains_only_allowlisted_public_artifacts(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                public_build.build_public(root=root, output_dir=output)
            self.assertEqual(set(p.name for p in output.iterdir()), public_build.PUBLIC_FILES)
            self.assertEqual(Path(call.call_args.args[0][2]), root / "packs" / "course")
            course = (output / "course.html").read_text(encoding="utf-8")
            index = (output / "index.html").read_text(encoding="utf-8")
            self.assertTrue(course.lstrip("\ufeff").lower().startswith("<!doctype html>"))
            self.assertIn('<title>Machine learning engineering interview preparation course</title>', course)
            self.assertIn('<title>Machine learning engineering interview preparation | Roadmap</title>', index)
            self.assertIn('<meta name="viewport" content="width=device-width,initial-scale=1">', course)
            self.assertEqual(index.count('name="viewport"'), 1)
            self.assertIn('rel="canonical" href="https://ylnhari.github.io/interview-prep/course.html"', course)
            self.assertNotIn("window.PREP_CLOUD_CONFIG=", course)
            self.assertNotIn("window.PREP_CLOUD_CONFIG=", index)
            self.assertIn("window.PREP_PUBLIC_PROGRESS =", course)
            self.assertNotIn("window.PREP_PUBLIC_PROGRESS_CONFIG=", course)
            self.assertNotIn("window.PREP_CLOUD =", course)
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

    def test_cloud_config_is_rejected_before_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            config_path = root / "must-not-be-read.json"
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                with self.assertRaisesRegex(ValueError, "do not accept owner cloud configuration"):
                    public_build.build_public(root=root, output_dir=output,
                                              cloud_config_path=config_path)
            call.assert_not_called()

    def test_typed_public_config_is_the_only_config_injected(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output, builder = self.fixture(root)
            config_path = root / "public-sync.json"
            config = {
                "purpose": "public-progress-v1",
                "enabled": True,
                "firebase": {
                    "apiKey": "public-api-key",
                    "authDomain": "example.firebaseapp.com",
                    "projectId": "example-project",
                    "appId": "1:123:web:abc",
                    "messagingSenderId": "123",
                },
            }
            config_path.write_text(json.dumps(config), encoding="utf-8")
            with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder):
                public_build.build_public(root=root, output_dir=output,
                                          public_sync_config_path=config_path)
            course = (output / "course.html").read_text(encoding="utf-8")
            self.assertTrue(course.lstrip("\ufeff").lower().startswith("<!doctype html>"))
            self.assertIn("window.PREP_PUBLIC_PROGRESS_CONFIG=", course)
            self.assertIn('"projectId":"example-project"', course)
            self.assertNotIn("window.PREP_CLOUD_CONFIG=", course)
            self.assertLess(course.index("<head>"), course.index("window.PREP_PUBLIC_PROGRESS_CONFIG="))

    def test_fragment_shell_becomes_a_complete_document(self):
        page = '<meta charset="utf-8"><title>Course</title><style>body{}</style><header>Course</header><main>Lesson</main>'
        document = public_build.ensure_html_document(page)
        self.assertTrue(document.startswith("<!doctype html>"))
        self.assertIn("<head>", document)
        self.assertIn("</head>\n<body>\n<header>", document)
        self.assertTrue(document.rstrip().endswith("</html>"))

    def test_invalid_public_sync_config_is_rejected_before_build(self):
        cases = (
            {"purpose": "public-progress-v1", "enabled": False, "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project", "appId": "app"}},
            {"purpose": "public-progress-v1", "enabled": True, "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project", "appId": "app", "privateKey": "no"}},
            {"purpose": "public-progress-v1", "enabled": True, "firebase": {"apiKey": "", "authDomain": "host", "projectId": "project", "appId": "app"}},
            {"purpose": "public-progress-v1", "enabled": True, "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project"}},
            {"purpose": "public-progress-v1", "enabled": True, "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project", "appId": "app"}, "serviceAccount": {}},
            {"purpose": "owner-progress-v1", "enabled": True, "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project", "appId": "app"}},
        )
        for config in cases:
            with self.subTest(config=config):
                with tempfile.TemporaryDirectory() as tmp:
                    root = Path(tmp)
                    output, builder = self.fixture(root)
                    config_path = root / "invalid.json"
                    config_path.write_text(json.dumps(config), encoding="utf-8")
                    with mock.patch.object(public_build.subprocess, "check_call", side_effect=builder) as call:
                        with self.assertRaisesRegex(ValueError, "public sync config"):
                            public_build.build_public(root=root, output_dir=output,
                                                      public_sync_config_path=config_path)
                    call.assert_not_called()

    def test_embedded_cloud_config_is_rejected(self):
        with self.assertRaisesRegex(ValueError, "must not define owner cloud configuration"):
            public_build.reject_cloud_config(
                "<script>window.PREP_CLOUD_CONFIG = {enabled: true};</script>")
        self.assertEqual(
            public_build.reject_cloud_config(
                "<script>var cloudConfig = window.PREP_CLOUD_CONFIG || null;</script>"),
            "<script>var cloudConfig = window.PREP_CLOUD_CONFIG || null;</script>")
        self.assertEqual(
            public_build.reject_cloud_config('<button id="cloud-btn">Sign in to sync</button>'),
            '<button id="cloud-btn">Sign in to sync</button>')

    def test_command_line_has_no_cloud_config_option(self):
        with contextlib.redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as raised:
                public_build.main(["--cloud-config", "must-not-be-read.json"])
        self.assertEqual(raised.exception.code, 2)

    def test_command_line_accepts_only_public_sync_config_option(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            output = root / "public-dist"
            config_path = root / "public.json"
            config_path.write_text(json.dumps({
                "purpose": "public-progress-v1",
                "enabled": True,
                "firebase": {"apiKey": "key", "authDomain": "host", "projectId": "project", "appId": "app"},
            }), encoding="utf-8")
            with mock.patch.object(public_build, "build_public", return_value=0) as build:
                public_build.main(["--output-dir", str(output), "--public-sync-config", str(config_path)])
            self.assertEqual(build.call_args.kwargs["output_dir"], str(output))
            self.assertEqual(build.call_args.kwargs["public_sync_config_path"], str(config_path))


if __name__ == "__main__":
    unittest.main()
