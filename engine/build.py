"""Build one pack round into a single self-contained HTML page.

Usage:
    python engine/build.py packs/<pack>/<round> [--out dist/<name>.html]

The page = engine/shell.html with three inlined scripts: the diagram library
(engine/viz-lib.js plus engine/viz/*.js), the shared core chapters (core/library.js
plus core/*.js, only if the pack uses any) and the pack content (packs/<pack>/<round>/content.js). Output is
escaped to pure ASCII so it renders correctly whatever charset the host assumes.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    with io.open(path, encoding="utf-8") as f:
        return f.read()


def ascii_only(html):
    bs = chr(92)

    def esc_js(m):
        return "".join(ch if ord(ch) < 128 else bs + "u%04x" % ord(ch) for ch in m.group(0))

    def esc_html(m):
        return "".join(ch if ord(ch) < 128 else "&#x%x;" % ord(ch) for ch in m.group(0))

    parts = re.split(r"(<script>[\s\S]*?</script>)", html)
    parts = [
        re.sub(r"[^\x00-\x7f]+", esc_js, p) if p.startswith("<script>") else re.sub(r"[^\x00-\x7f]+", esc_html, p)
        for p in parts
    ]
    out = "".join(parts)
    if not out.lstrip().startswith("<meta charset"):
        out = '<meta charset="utf-8">\n' + out
    assert all(ord(c) < 128 for c in out)
    return out


def core_files():
    """core/library.js first, then every other core/*.js in name order (extension files add to window.PREP_CORE)."""
    d = os.path.join(ROOT, "core")
    if not os.path.isdir(d):
        return []
    names = sorted(n for n in os.listdir(d) if n.endswith(".js") and n != "library.js")
    files = [os.path.join(d, "library.js")] if os.path.exists(os.path.join(d, "library.js")) else []
    return files + [os.path.join(d, n) for n in names]


def viz_files():
    """engine/viz-lib.js first, then every engine/viz/*.js in name order (extension files add to window.VIZLIB)."""
    files = []
    base = os.path.join(ROOT, "engine", "viz-lib.js")
    if os.path.exists(base):
        files.append(base)
    d = os.path.join(ROOT, "engine", "viz")
    if os.path.isdir(d):
        files += [os.path.join(d, n) for n in sorted(os.listdir(d)) if n.endswith(".js")]
    return files


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    pack_dir = os.path.abspath(argv[1])
    content_path = os.path.join(pack_dir, "content.js")
    if not os.path.exists(content_path):
        print("no content.js in", pack_dir)
        return 2
    rel = os.path.relpath(pack_dir, os.path.join(ROOT, "packs")).replace(os.sep, "__")
    out_path = os.path.join(ROOT, "dist", rel + ".html")
    if "--out" in argv:
        out_path = os.path.abspath(argv[argv.index("--out") + 1])

    shell = read(os.path.join(ROOT, "engine", "shell.html"))
    viz = "\n".join(read(p) for p in viz_files())
    content = read(content_path)
    core = ""
    if re.search(r"""["']?useCore["']?\s*:""", content):
        core = "\n".join(read(p) for p in core_files())
    overlays_path = os.path.join(pack_dir, "overlays.js")
    overlays = read(overlays_path) if os.path.exists(overlays_path) else ""
    for marker in ("/*__VIZLIB__*/", "/*__CORE__*/", "/*__CONTENT__*/", "/*__OVERLAYS__*/"):
        assert marker in shell, "shell missing marker " + marker
    html = shell.replace("/*__VIZLIB__*/", viz, 1).replace("/*__CORE__*/", core, 1).replace("/*__CONTENT__*/", content, 1).replace("/*__OVERLAYS__*/", overlays, 1)
    cloud_path = os.path.join(ROOT, "engine", "cloud-progress.js")
    if "/*__CLOUD__*/" in html:
        html = html.replace("/*__CLOUD__*/", read(cloud_path) if os.path.exists(cloud_path) else "", 1)
    if "--cloud-config" in argv:
        config_path = argv[argv.index("--cloud-config") + 1]
        config = json.loads(read(config_path))
        # Firebase web configuration is public; never accept service credentials here.
        allowed = {"enabled", "firebase"}
        if not isinstance(config, dict) or set(config) - allowed:
            raise ValueError("Cloud config must contain only enabled and firebase web settings")
        firebase_config = config.get("firebase", {})
        web_keys = {"apiKey", "authDomain", "projectId", "appId", "messagingSenderId"}
        if not isinstance(firebase_config, dict) or set(firebase_config) - web_keys:
            raise ValueError("Only Firebase public web settings are allowed")
        encoded = json.dumps(config, ensure_ascii=True).replace("<", "\\u003c")
        html = "<script>window.PREP_CLOUD_CONFIG=" + encoded + ";</script>\n" + html
    html = ascii_only(html)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with io.open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print("built", os.path.relpath(out_path, ROOT), len(html), "bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
