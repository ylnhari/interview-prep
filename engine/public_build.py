"""Build the allowlisted public course into a clean, separate Pages directory.

Usage: python engine/public_build.py [--output-dir public-dist] [--base-url https://.../]
                                    [--public-sync-config public-sync.json]

The default artifact is fully functional for guests: progress stays in the
browser and export/import remain available.  An explicitly supplied, typed
Firebase *public web* configuration enables the separate public progress
adapter.  This builder never accepts owner ``PREP_CLOUD`` configuration.
"""
import argparse
import html
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_BASE_URL = "https://ylnhari.github.io/interview-prep/"
PUBLIC_FILES = {"index.html", "course.html", "robots.txt", "sitemap.xml"}
PUBLIC_PROGRESS_MARKER = "/*__PUBLIC_PROGRESS__*/"
PUBLIC_PROGRESS_CONFIG_GLOBAL = "window.PREP_PUBLIC_PROGRESS_CONFIG"
PUBLIC_FIREBASE_KEYS = {"apiKey", "authDomain", "projectId", "appId", "messagingSenderId"}
REQUIRED_PUBLIC_FIREBASE_KEYS = {"apiKey", "authDomain", "projectId", "appId"}
DESCRIPTION = ("A free, open course for machine learning engineering interviews, "
               "with technical chapters, worked examples, and practice questions.")


def validate_base_url(value):
    if not value.startswith("https://") or "?" in value or "#" in value:
        raise ValueError("base URL must be an https URL without query or fragment")
    return value.rstrip("/") + "/"


def add_metadata(page, *, title, canonical, description=DESCRIPTION):
    if "</title>" not in page:
        raise ValueError("generated HTML has no title element")
    page = re.sub(r"<title>[\s\S]*?</title>", "<title>" + html.escape(title) + "</title>", page, count=1)
    if not re.search(r'<meta\s+name=["\']viewport["\']', page, flags=re.IGNORECASE):
        page = re.sub(r"<head([^>]*)>", r'<head\1>\n<meta name="viewport" content="width=device-width,initial-scale=1">', page, count=1, flags=re.IGNORECASE)
    tags = (
        '<meta name="description" content="%s">\n'
        '<meta name="robots" content="index,follow">\n'
        '<link rel="canonical" href="%s">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:title" content="%s">\n'
        '<meta property="og:description" content="%s">\n'
        '<meta property="og:url" content="%s">\n'
    ) % (html.escape(description, quote=True), html.escape(canonical, quote=True),
         html.escape(title, quote=True), html.escape(description, quote=True),
         html.escape(canonical, quote=True))
    page = page.replace("</title>", "</title>\n" + tags, 1)
    return page


def ensure_html_document(page):
    """Give the public course a standards-mode document envelope.

    The reusable shell is intentionally a fragment so local/private consumers
    can embed it.  Pages receives a complete document: the style and metadata
    precede the header, while the rendered course begins at ``<header>``.
    """
    if re.match(r"^\ufeff?\s*<!doctype\s+html", page, flags=re.IGNORECASE):
        return page
    header = re.search(r"<header\b", page, flags=re.IGNORECASE)
    if not header:
        raise ValueError("generated public course has no document boundary")
    head = page[:header.start()]
    body = page[header.start():]
    return "<!doctype html>\n<html lang=\"en\">\n<head>\n" + head + "\n</head>\n<body>\n" + body + "\n</body>\n</html>\n"


def reject_cloud_config(page):
    """Fail closed if public HTML defines owner-only cloud configuration.

    ``PREP_CLOUD_CONFIG`` belongs to the existing private implementation.  The
    public course may contain the separately named public adapter and its
    public-only controls, but must never receive the owner configuration.
    """
    if re.search(r"\bwindow\.PREP_CLOUD_CONFIG\s*=", page):
        raise ValueError("public output must not define owner cloud configuration")
    return page


def read_public_sync_config(path):
    """Read the only configuration type accepted by the public build.

    Firebase web settings identify a project in browser code; they are not a
    service account or a deployment secret.  Keeping this exact, narrow shape
    prevents a convenient build flag from becoming a generic config channel.
    """
    try:
        import json
        config = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise ValueError("public sync config must be readable JSON") from exc
    if not isinstance(config, dict) or set(config) != {"purpose", "enabled", "firebase"}:
        raise ValueError("public sync config must contain exactly purpose, enabled and firebase")
    if config["purpose"] != "public-progress-v1":
        raise ValueError("public sync config purpose must be public-progress-v1")
    if config["enabled"] is not True:
        raise ValueError("public sync config enabled must be true")
    firebase = config["firebase"]
    if not isinstance(firebase, dict) or not REQUIRED_PUBLIC_FIREBASE_KEYS <= set(firebase) or set(firebase) - PUBLIC_FIREBASE_KEYS:
        raise ValueError("public sync config must contain only supported Firebase public web settings")
    for key, value in firebase.items():
        if not isinstance(value, str) or not value or len(value) > 512:
            raise ValueError("public sync config Firebase values must be non-empty strings up to 512 characters")
    return config


def inline_public_progress(page, root, config):
    """Replace the public-only shell marker and optionally inject its config."""
    progress_path = Path(root) / "engine" / "public-progress.js"
    if not progress_path.is_file():
        raise FileNotFoundError("public progress adapter is missing")
    if page.count(PUBLIC_PROGRESS_MARKER) != 1:
        raise ValueError("generated public course must contain exactly one public progress marker")
    progress_source = progress_path.read_text(encoding="utf-8")
    page = page.replace(PUBLIC_PROGRESS_MARKER, progress_source, 1)
    if config is not None:
        import json
        encoded = json.dumps(config, ensure_ascii=True, separators=(",", ":")).replace("<", "\\u003c")
        head = re.search(r"<head\b[^>]*>", page, flags=re.IGNORECASE)
        if not head:
            raise ValueError("generated public course has no head for public sync config")
        script = "\n<script>" + PUBLIC_PROGRESS_CONFIG_GLOBAL + "=" + encoded + ";</script>"
        page = page[:head.end()] + script + page[head.end():]
    try:
        page.encode("ascii")
    except UnicodeEncodeError as exc:
        raise ValueError("public progress adapter must be ASCII-safe for the self-contained build") from exc
    return page


def strip_owner_progress(page, root):
    """Remove the private adapter that ``build.py`` normally inlines.

    The generic builder also serves private packs and intentionally retains its
    owner adapter.  Public delivery cannot carry that adapter, even inertly:
    keeping it would make a typed public configuration build contain two
    progress implementations and the private listener-capable code.
    """
    owner_path = Path(root) / "engine" / "cloud-progress.js"
    if not owner_path.is_file():
        raise FileNotFoundError("owner progress adapter is missing")
    owner_script = "<script>\n" + owner_path.read_text(encoding="utf-8") + "\n</script>"
    if page.count(owner_script) != 1:
        raise ValueError("generated public course must contain exactly one owner progress adapter")
    return page.replace(owner_script, "", 1)


def output_names(directory):
    if not directory.exists():
        return set()
    names = set()
    for path in directory.rglob("*"):
        if is_reparse_point(path):
            raise ValueError("public output contains a symlink or reparse point: " + path.relative_to(directory).as_posix())
        if path.is_file():
            names.add(path.relative_to(directory).as_posix())
        elif path.is_dir():
            raise ValueError("public output contains an unexpected directory: " + path.relative_to(directory).as_posix())
    unexpected = names - PUBLIC_FILES
    if unexpected:
        raise ValueError("public output contains unexpected files: " + ", ".join(sorted(unexpected)))
    return names


def is_reparse_point(path):
    """Return true for symlinks and Windows junctions/reparse points."""
    try:
        info = path.lstat()
    except FileNotFoundError:
        return False
    reparse_flag = getattr(stat, "FILE_ATTRIBUTE_REPARSE_POINT", 0x400)
    attributes = getattr(info, "st_file_attributes", 0)
    return stat.S_ISLNK(info.st_mode) or bool(attributes & reparse_flag)


def reject_reparse_path(path):
    """Reject reparse points in the output path before resolving it."""
    absolute = Path(os.path.abspath(os.fspath(path)))
    current = Path(absolute.anchor)
    for part in absolute.parts[1:]:
        current = current / part
        if is_reparse_point(current):
            raise ValueError("public output path contains a symlink or reparse point: " + str(current))


def make_sitemap(base_url):
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for page in ("", "course.html"):
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = base_url + page
    return ET.tostring(urlset, encoding="unicode", xml_declaration=True) + "\n"


def build_public(root=ROOT, output_dir=None, base_url=DEFAULT_BASE_URL, cloud_config_path=None,
                 public_sync_config_path=None):
    if cloud_config_path is not None:
        raise ValueError("public builds do not accept owner cloud configuration")
    root = Path(root).resolve()
    public_sync_config = (read_public_sync_config(public_sync_config_path)
                          if public_sync_config_path is not None else None)
    output_dir = Path(output_dir or root / "public-dist")
    reject_reparse_path(output_dir)
    output_dir = output_dir.resolve()
    base_url = validate_base_url(base_url)
    protected = [root / "packs", root / "local", root / "dist", root / ".git"]
    if output_dir == root or output_dir in root.parents or any(
            output_dir == p or p in output_dir.parents or output_dir in p.parents for p in protected):
        raise ValueError("public output directory must be separate from packs, local, and dist")
    output_names(output_dir)

    course_dir = root / "packs" / "course"
    if not (course_dir / "content.js").is_file():
        raise FileNotFoundError("allowlisted public course is missing")
    output_dir.mkdir(parents=True, exist_ok=True)
    course_path = output_dir / "course.html"
    subprocess.check_call([
        sys.executable, str(root / "engine" / "build.py"), str(course_dir),
        "--out", str(course_path),
    ])
    course_html = course_path.read_text(encoding="utf-8")
    course_html = ensure_html_document(course_html)
    course_html = strip_owner_progress(course_html, root)
    course_html = inline_public_progress(course_html, root, public_sync_config)
    title = "Machine learning engineering interview preparation course"
    course_html = add_metadata(
        course_html, title=title, canonical=base_url + "course.html",
        description="Read the free course for machine learning engineering interviews, with technical chapters and practice questions.")
    course_html = reject_cloud_config(course_html)
    course_path.write_text(course_html, encoding="utf-8")

    # This is deliberately the sole entry: do not use roadmap.rounds(), which discovers local packs.
    engine_dir = str(Path(__file__).resolve().parent)
    if engine_dir not in sys.path:
        sys.path.insert(0, engine_dir)
    import roadmap
    roadmap_entry = roadmap.public_course_entry(root=str(root), page="course.html")
    index_html = roadmap.render_index([roadmap_entry])
    index_html = add_metadata(
        index_html, title="Machine learning engineering interview preparation | Roadmap", canonical=base_url,
        description="Follow the free machine learning engineering interview course roadmap, with chapters, sections and browser-saved progress.")
    index_html = reject_cloud_config(index_html)
    (output_dir / "index.html").write_text(index_html, encoding="utf-8")
    (output_dir / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nSitemap: " + base_url + "sitemap.xml\n", encoding="ascii")
    (output_dir / "sitemap.xml").write_text(make_sitemap(base_url), encoding="utf-8")
    names = output_names(output_dir)
    if names != PUBLIC_FILES:
        raise ValueError("public output is incomplete: " + ", ".join(sorted(PUBLIC_FILES - names)))
    print("public build: course only -> %s" % output_dir)
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", default=str(ROOT / "public-dist"))
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--public-sync-config",
                        help="JSON containing only typed public Firebase web settings")
    args = parser.parse_args(argv)
    return build_public(output_dir=args.output_dir, base_url=args.base_url,
                        public_sync_config_path=args.public_sync_config)


if __name__ == "__main__":
    sys.exit(main())
