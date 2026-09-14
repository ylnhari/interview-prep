"""Build the allowlisted public course into a clean, separate Pages directory.

Usage: python engine/public_build.py [--output-dir public-dist] [--base-url https://.../]

Public output is guest-only: browser-local progress plus export/import, with no
cloud configuration. Owner sync belongs to the separate private app.
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
DESCRIPTION = ("A free, open course for machine learning and software engineering interviews, "
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


def reject_cloud_config(page):
    """Fail closed if public HTML defines cloud settings or exposes shared sync controls."""
    if re.search(r"\bwindow\.PREP_CLOUD_CONFIG\s*=", page):
        raise ValueError("public output must not define cloud configuration")
    for element_id in ("cloud-btn", "migrate-btn", "sync-policy"):
        element = re.search(
            r"<[^>]+\bid=[\"']" + re.escape(element_id) + r"[\"'][^>]*>",
            page, flags=re.IGNORECASE)
        if element and not re.search(r"\bhidden(?:\s|=|>)", element.group(0), flags=re.IGNORECASE):
            raise ValueError("public output must not expose cloud-sync controls: " + element_id)
    return page


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


def build_public(root=ROOT, output_dir=None, base_url=DEFAULT_BASE_URL, cloud_config_path=None):
    if cloud_config_path is not None:
        raise ValueError("public builds do not accept cloud configuration; owner sync belongs in the private app")
    root = Path(root).resolve()
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
    title = "Interview preparation course"
    course_html = add_metadata(
        course_html, title=title, canonical=base_url + "course.html",
        description="Read the free course for machine learning and software engineering interviews, with technical chapters and practice questions.")
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
        index_html, title="Interview preparation course | Roadmap", canonical=base_url,
        description="Follow the free interview preparation course roadmap, with chapters, sections and browser-saved progress.")
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
    args = parser.parse_args(argv)
    return build_public(output_dir=args.output_dir, base_url=args.base_url)


if __name__ == "__main__":
    sys.exit(main())
