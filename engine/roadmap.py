"""Build dist/index.html, the course home page: every pack -> track -> chapter -> section as a
vertical path, with deep links into the built pages and per-chapter progress read from the
browser's saved state (localStorage key prep-state-<meta.id>-v1).

Usage: python engine/roadmap.py            (scans packs/ and builds every round it finds, then the index)
       python engine/roadmap.py --index    (index only, from already-built pages)

Standard library only. Output is escaped to pure ASCII, like engine/build.py.
"""
import html as htmlmod
import io
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PACKS = os.path.join(ROOT, "packs")
DIST = os.path.join(ROOT, "dist")


def rounds():
    out = []
    for pack in sorted(os.listdir(PACKS)):
        if pack.startswith("_"):
            continue
        pdir = os.path.join(PACKS, pack)
        if not os.path.isdir(pdir):
            continue
        if os.path.exists(os.path.join(pdir, "content.js")):
            out.append((pack, None, pdir))
        for rnd in sorted(os.listdir(pdir)):
            rdir = os.path.join(pdir, rnd)
            if os.path.isdir(rdir) and os.path.exists(os.path.join(rdir, "content.js")):
                out.append((pack, rnd, rdir))
    return out


def summarise(rdir):
    js = r"""
const fs=require('fs');const path=require('path');const w={};
const root=process.argv[1], rdir=process.argv[2];
try{const cd=path.join(root,'core');['library.js'].concat(fs.readdirSync(cd).filter(n=>n.endsWith('.js')&&n!=='library.js').sort()).forEach(n=>{new Function('window',fs.readFileSync(path.join(cd,n),'utf8'))(w);});}catch(e){}
new Function('window',fs.readFileSync(path.join(rdir,'content.js'),'utf8'))(w);
const ovp=path.join(rdir,'overlays.js'); if(fs.existsSync(ovp)) new Function('window',fs.readFileSync(ovp,'utf8'))(w);
const C=w.PREP_CONTENT; if(C.useCore&&w.PREP_CORE) C.useCore.forEach(id=>{ if(w.PREP_CORE[id]&&!C.topics.some(t=>t.id===id)) C.topics.push(JSON.parse(JSON.stringify(w.PREP_CORE[id])));});
C.topics.forEach(t=>{t.learn=t.learn||[];t.activities=t.activities||[];});
const OV=w.PREP_OVERLAYS||C.overlays||{}; Object.keys(OV).forEach(id=>{const t=C.topics.find(x=>x.id===id); if(!t) return; const o=OV[id]||{}; if(o.learn){let lf=-1;t.learn.forEach((c,i)=>{if(c.part==='field')lf=i;}); o.learn.forEach((c,k)=>t.learn.splice(lf+1+k,0,c));} if(o.activities) t.activities=t.activities.concat(o.activities); if(o.sayItOutLoud) t.sayItOutLoud=o.sayItOutLoud;});
const byId=Object.fromEntries(C.topics.map(t=>[t.id,t]));
const groups=(C.groups||[{id:'all',label:'Chapters',ids:C.topics.map(t=>t.id)}]).map(g=>({id:g.id,label:g.label,sub:g.sub||'',chapters:g.ids.filter(i=>byId[i]).map(i=>({id:i,title:byId[i].title,level:byId[i].level||'good',levelLabel:byId[i].levelLabel||'',kind:byId[i].kind||'',sections:byId[i].learn.map(c=>({id:c.id,title:c.title,part:c.part||'',link:!!(c.link&&c.link.url)})),exercises:byId[i].activities.length,hasSay:!!byId[i].sayItOutLoud}))}));
console.log(JSON.stringify({meta:C.meta||{},interviewAt:C.interviewAt||null,hasInterviewer:!!C.interviewer,groups,glossary:!!(C.glossary&&C.glossary.length)}));
"""
    out = subprocess.check_output(["node", "-e", js, ROOT, rdir], encoding="utf-8")
    return json.loads(out)


def build_round(rdir):
    subprocess.check_call([sys.executable, os.path.join(ROOT, "engine", "build.py"), rdir])


def page_name(pack, rnd):
    return (pack + ("__" + rnd if rnd else "")) + ".html"


def esc(s):
    return htmlmod.escape(str(s if s is not None else ""), quote=True)


def ascii_only(text):
    """Escape every non-ASCII character: HTML entities outside <script>, \\u escapes inside."""
    bs = chr(92)

    def esc_js(m):
        return "".join(ch if ord(ch) < 128 else bs + "u%04x" % ord(ch) for ch in m.group(0))

    def esc_html(m):
        return "".join(ch if ord(ch) < 128 else "&#x%x;" % ord(ch) for ch in m.group(0))

    parts = re.split(r"(<script>[\s\S]*?</script>)", text)
    parts = [
        re.sub(r"[^\x00-\x7f]+", esc_js, p) if p.startswith("<script>") else re.sub(r"[^\x00-\x7f]+", esc_html, p)
        for p in parts
    ]
    out = "".join(parts)
    assert all(ord(c) < 128 for c in out)
    return out


CSS = """
:root{--bg:#f3f4f7;--surface:#fff;--surface-2:#e9ecf2;--surface-3:#d7dce6;--ink:#161b22;--ink-dim:#545d6b;--border:#d7dce6;--border-strong:#b7c0cf;--accent:#2454cc;--accent-weak:#e5ebfb;--accent-ink:#173c99;--on-accent:#fff;--good:#177a5c;--good-weak:#def3ea;--warning:#9e6f0a;--warning-weak:#fbf0d6;--danger:#bf3f2a;--danger-weak:#fbe7e2;--shadow:0 1px 2px rgba(20,30,50,.05),0 6px 20px -14px rgba(20,30,50,.18);--font-display:'Sora',ui-sans-serif,system-ui,sans-serif;--font-body:'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif;--font-mono:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0d121c;--surface:#141a27;--surface-2:#1b2331;--surface-3:#283143;--ink:#e8edf6;--ink-dim:#9ea9bd;--border:#29324a;--border-strong:#3c4862;--accent:#7ea3ff;--accent-weak:#1b2a4d;--accent-ink:#c6d6ff;--on-accent:#0d121c;--good:#5fdcb0;--good-weak:#123526;--warning:#f2c463;--warning-weak:#3a2c0c;--danger:#ff8a6e;--danger-weak:#3a2013;--shadow:0 1px 2px rgba(0,0,0,.35),0 10px 28px -18px rgba(0,0,0,.6);color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0d121c;--surface:#141a27;--surface-2:#1b2331;--surface-3:#283143;--ink:#e8edf6;--ink-dim:#9ea9bd;--border:#29324a;--border-strong:#3c4862;--accent:#7ea3ff;--accent-weak:#1b2a4d;--accent-ink:#c6d6ff;--on-accent:#0d121c;--good:#5fdcb0;--good-weak:#123526;--warning:#f2c463;--warning-weak:#3a2c0c;--danger:#ff8a6e;--danger-weak:#3a2013;--shadow:0 1px 2px rgba(0,0,0,.35),0 10px 28px -18px rgba(0,0,0,.6);color-scheme:dark}
*{box-sizing:border-box}
@media (prefers-reduced-motion:reduce){*{transition-duration:.001ms!important;scroll-behavior:auto!important}}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font-body);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
[hidden]{display:none!important}
.top{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--border)}
.top-inner{max-width:1120px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.top .site{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-dim);text-decoration:none;margin-right:auto}
.tabs{display:flex;gap:4px;flex-wrap:wrap}
.tabs a{font-size:12.5px;font-weight:600;text-decoration:none;color:var(--ink-dim);padding:5px 10px;border-radius:999px;border:1px solid transparent}
.tabs a:hover{color:var(--accent);background:var(--accent-weak)}
.tabs a.cur{color:var(--accent-ink);background:var(--accent-weak)}
.wrap{max-width:1120px;margin:0 auto;padding:36px 20px 64px}
.hero{max-width:70ch;margin-bottom:28px}
.hero .eb{font-family:var(--font-mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-ink)}
.hero h1{font-family:var(--font-display);font-size:clamp(28px,2.6vw+14px,40px);line-height:1.12;letter-spacing:-.025em;margin:8px 0 12px;text-wrap:balance}
.hero p{font-size:16.5px;line-height:1.6;color:var(--ink-dim);margin:0 0 18px}
.hero .cta{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.hero .cta > *{min-width:0;max-width:100%}
.path,.track,.pack{min-width:0;max-width:100%}
.pack .ph .t{min-width:0;max-width:100%}
.pack h2{overflow-wrap:anywhere}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--on-accent);border:1px solid var(--accent);border-radius:10px;padding:10px 16px;font-family:var(--font-display);font-weight:600;font-size:14px;text-decoration:none;cursor:pointer;transition:background-color .15s ease}
.btn:hover{background:color-mix(in srgb,var(--accent) 88%,var(--ink))}
.btn.quiet{background:var(--surface);color:var(--ink);border-color:var(--border-strong);font-family:var(--font-body);font-weight:500;font-size:13px;padding:7px 12px}
.btn.quiet:hover{background:var(--surface-2);border-color:var(--accent)}
.btn .k{font-family:var(--font-mono);font-size:10px;letter-spacing:.07em;text-transform:uppercase;opacity:.85}
.stats{font-family:var(--font-mono);font-size:11.5px;color:var(--ink-dim);font-variant-numeric:tabular-nums}
.stats b{color:var(--ink);font-weight:500}
.legend{display:flex;gap:6px 18px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--ink-dim);margin:0 0 24px;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.legend .lg{display:inline-flex;align-items:center;gap:6px}
.legend .sw{width:9px;height:9px;border-radius:50%;flex:none}
.legend .sw.danger{background:var(--danger)}.legend .sw.warning{background:var(--warning)}.legend .sw.good{background:var(--good)}
.legend .tk{font-family:var(--font-mono);color:var(--good);font-size:12px}
.legend .bar{width:36px;height:4px;display:inline-block}
.pack{margin-bottom:44px;scroll-margin-top:64px}
.pack .ph{display:flex;align-items:flex-end;gap:12px 20px;flex-wrap:wrap;margin-bottom:6px}
.pack .ph .t{margin-right:auto;min-width:0}
.pack .eb{font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-dim)}
.pack h2{font-family:var(--font-display);font-size:22px;line-height:1.2;letter-spacing:-.015em;margin:4px 0 0}
.pack .pm{font-family:var(--font-mono);font-size:11.5px;color:var(--ink-dim);display:flex;gap:6px 16px;flex-wrap:wrap;margin:8px 0 18px;font-variant-numeric:tabular-nums}
.pack .pm b{color:var(--ink);font-weight:500}
.pack .pm .pre{color:var(--accent-ink)}
.pack .pm .pre.ok{color:var(--good)}
.path{position:relative;padding-left:34px}
.path::before{content:"";position:absolute;left:12px;top:14px;bottom:14px;width:2px;background:var(--surface-3)}
.track{position:relative;margin-bottom:22px}
.track::before{content:attr(data-n);position:absolute;left:-34px;top:2px;width:26px;height:26px;border-radius:50%;background:var(--accent);color:var(--on-accent);font-family:var(--font-mono);font-size:11px;display:grid;place-items:center;border:3px solid var(--bg)}
.track.done::before{background:var(--good)}
.track .th{margin-bottom:10px;padding-top:4px}
.track .th h3{font-family:var(--font-display);font-size:16.5px;line-height:1.25;margin:0;letter-spacing:-.01em}
.track .th .ts{font-size:13px;color:var(--ink-dim);margin-top:2px}
.chs{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media (min-width:860px){.chs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.ch{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px 12px;box-shadow:var(--shadow);min-width:0;max-width:100%}
.ch .hd{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}
.ch .hd .pill{max-width:100%;white-space:normal;margin-left:30px}
@media (min-width:600px){.ch .hd .pill{margin-left:0}}
.ch .hd a{font-family:var(--font-display);font-weight:600;font-size:14.5px;line-height:1.35;color:var(--ink);text-decoration:none;flex:1 1 16ch;min-width:0;text-wrap:balance}
.ch .hd a:hover{color:var(--accent)}
.ch .hd .cn{font-family:var(--font-mono);font-size:11px;color:var(--accent-ink);min-width:22px;margin-top:2px;font-variant-numeric:tabular-nums}
.ch .cm{display:flex;align-items:center;gap:8px 10px;flex-wrap:wrap;margin:8px 0 0 30px;font-family:var(--font-mono);font-size:10.5px;color:var(--ink-dim);font-variant-numeric:tabular-nums}
.pill{font-family:var(--font-mono);font-size:9.5px;font-weight:500;text-transform:uppercase;letter-spacing:.05em;padding:1px 7px;border-radius:999px;border:1px solid transparent;white-space:nowrap}
.pill.danger{background:var(--danger-weak);color:var(--danger)}.pill.warning{background:var(--warning-weak);color:var(--warning)}.pill.good{background:var(--good-weak);color:var(--good)}
.bar{height:4px;border-radius:2px;background:var(--surface-3);overflow:hidden;flex:1 1 60px;max-width:140px}
.bar i{display:block;height:100%;width:0;background:var(--accent);transition:width .3s ease}
.ch.done .bar i{background:var(--good)}
.secs{list-style:none;margin:8px 0 0 30px;padding:0;border-top:1px dashed var(--border);padding-top:6px}
.secs li{font-size:12.5px;line-height:1.4;margin:0;padding:2px 0;display:flex;gap:8px;align-items:baseline}
.secs a{color:var(--ink-dim);text-decoration:none;min-width:0}
.secs a:hover{color:var(--accent)}
.secs .n{font-family:var(--font-mono);font-size:10px;color:var(--ink-dim);min-width:16px;text-align:right;flex:none}
.secs li.done a{color:var(--good)}.secs li.done .n{color:var(--good)}
.secs li.x a{color:var(--accent-ink)}
.secs li.x .n{color:var(--accent-ink)}
footer{max-width:1120px;margin:0 auto;padding:16px 20px 48px;border-top:1px solid var(--border);font-size:12px;line-height:1.5;color:var(--ink-dim);font-family:var(--font-mono)}
"""

PROMISE = ("A free course for machine learning and software engineering interviews. Each chapter teaches one "
           "subject: it defines every term before using it, draws the mechanism in a diagram, points you at the "
           "best pages and videos on that subject, and gives you exercises with a list of what a good answer "
           "contains. Take the tracks in order, or start with the one your interview will test most. Your "
           "progress is saved in this browser, and you can save it to a file from any chapter and load it on "
           "another device.")


def render_pack(e, n_packs):
    s = e["summary"]
    m = s.get("meta", {})
    page = e["page"]
    title = m.get("title") or e["pack"]
    eb = m.get("eyebrow") or e["pack"]
    key = "prep-state-%s-v1" % m.get("id", "pack")
    n_ch = sum(len(g["chapters"]) for g in s["groups"])
    n_sec = sum(len(c["sections"]) for g in s["groups"] for c in g["chapters"])
    n_ex = sum(c["exercises"] for g in s["groups"] for c in g["chapters"])
    prereq = [c for g in s["groups"] for c in g["chapters"] if c.get("kind") == "prereqs"]
    out = []
    out.append('<section class="pack" id="pack-%s" data-key="%s" data-page="%s">' % (esc(e["slug"]), esc(key), esc(page)))
    out.append('<div class="ph"><div class="t"><div class="eb">%s</div><h2>%s</h2></div>'
               '<a class="btn quiet" href="%s">Open the chapters &rarr;</a></div>' % (esc(eb), esc(title), esc(page)))
    pm = ['<span><b>%d</b> tracks</span><span><b>%d</b> chapters</span><span><b>%d</b> sections</span><span><b>%d</b> exercises</span>'
          % (len(s["groups"]), n_ch, n_sec, n_ex), '<span class="pp"><b class="pv">0%</b> done</span>']
    if prereq:
        pm.append('<span class="pre" data-prereq="%s">Before you start: <b>0</b> of %d course chapters done</span>' % (esc(prereq[0]["id"]), len(prereq[0]["sections"])))
    out.append('<div class="pm">%s</div>' % "".join(pm))
    out.append('<div class="path">')
    for gi, g in enumerate(s["groups"]):
        out.append('<div class="track" data-n="%d"><div class="th"><h3>%s</h3>%s</div><div class="chs">' % (
            gi + 1, esc(g["label"]), ('<div class="ts">%s</div>' % esc(g["sub"])) if g.get("sub") else ""))
        for ch in g["chapters"]:
            n_s = len(ch["sections"])
            out.append('<article class="ch" data-topic="%s"><div class="hd"><span class="cn"></span><a href="%s#%s">%s</a>%s</div>' % (
                esc(ch["id"]), esc(page), esc(ch["id"]), esc(ch["title"]),
                ('<span class="pill %s">%s</span>' % (esc(ch["level"]), esc(ch["levelLabel"]))) if ch.get("levelLabel") else ""))
            meta = ['<span class="sc">%d section%s</span>' % (n_s, "" if n_s == 1 else "s")]
            if ch["exercises"]:
                meta.append('<span class="xc">%d exercise%s</span>' % (ch["exercises"], "" if ch["exercises"] == 1 else "s"))
            if ch.get("hasSay"):
                meta.append("<span>spoken answer</span>")
            meta.append('<span class="bar"><i></i></span><span class="pc"></span>')
            out.append('<div class="cm">%s</div>' % "".join(meta))
            out.append('<ul class="secs">')
            for i, sec in enumerate(ch["sections"]):
                out.append('<li data-sec="%s"><span class="n">%d</span><a href="%s#%s/%s">%s</a></li>' % (
                    esc(sec["id"]), i + 1, esc(page), esc(ch["id"]), esc(sec["id"]), esc(sec["title"])))
            if ch["exercises"]:
                out.append('<li class="x"><span class="n">&middot;</span><a href="%s#%s">Exercises (%d)%s</a></li>' % (
                    esc(page), esc(ch["id"]), ch["exercises"], " and spoken answer" if ch.get("hasSay") else ""))
            out.append("</ul></article>")
        out.append("</div></div>")
    out.append("</div></section>")
    return "\n".join(out)


SCRIPT = r"""
(function () {
  function read(key) { try { var st = JSON.parse(localStorage.getItem(key) || 'null'); return st && st.topics && typeof st.topics === 'object' ? st : null; } catch (e) { return null; } }
  var first = null, firstAny = null, chapterNo = 0;
  document.querySelectorAll('section.pack').forEach(function (sec) {
    var st = read(sec.getAttribute('data-key')); var page = sec.getAttribute('data-page');
    var packDone = 0, packTotal = 0, n = 0;
    sec.querySelectorAll('.ch').forEach(function (ch) {
      n++; var cn = ch.querySelector('.cn'); if (cn) cn.textContent = n;
      var tid = ch.getAttribute('data-topic'); var t = st && st.topics[tid];
      var lis = ch.querySelectorAll('li[data-sec]'); var done = 0;
      lis.forEach(function (li) {
        var sid = li.getAttribute('data-sec');
        if (t && t.learn && t.learn[sid]) { li.classList.add('done'); done++; }
        else if (!first) first = { href: page + '#' + tid + '/' + sid, chapter: ch.querySelector('.hd a').textContent, section: li.querySelector('a').textContent };
        if (!firstAny) firstAny = { href: page + '#' + tid + '/' + sid, chapter: ch.querySelector('.hd a').textContent, section: li.querySelector('a').textContent };
      });
      var xc = ch.querySelector('.xc'); if (xc && t && t.acts) { var passed = 0, total = parseInt(xc.textContent, 10) || 0; Object.keys(t.acts).forEach(function (k) { if (t.acts[k] && t.acts[k].status === 'pass') passed++; }); if (passed) xc.textContent = passed + '/' + total + ' exercises done'; }
      var pct = lis.length ? Math.round(100 * done / lis.length) : 0;
      var bar = ch.querySelector('.bar i'); if (bar) bar.style.width = pct + '%';
      var pc = ch.querySelector('.pc'); if (pc) pc.textContent = lis.length ? done + '/' + lis.length : '';
      if (lis.length && done === lis.length) ch.classList.add('done');
      packDone += done; packTotal += lis.length;
    });
    sec.querySelectorAll('.track').forEach(function (tr) { var chs = tr.querySelectorAll('.ch'); var all = chs.length > 0; chs.forEach(function (c) { if (!c.classList.contains('done')) all = false; }); if (all) tr.classList.add('done'); });
    var pv = sec.querySelector('.pv'); if (pv) pv.textContent = (packTotal ? Math.round(100 * packDone / packTotal) : 0) + '%';
    var pre = sec.querySelector('.pre');
    if (pre) { var pt = st && st.topics[pre.getAttribute('data-prereq')]; var pd = 0; var total = 0; sec.querySelectorAll('.ch[data-topic="' + pre.getAttribute('data-prereq') + '"] li[data-sec]').forEach(function (li) { total++; if (pt && pt.learn && pt.learn[li.getAttribute('data-sec')]) pd++; }); pre.querySelector('b').textContent = pd; if (total && pd === total) pre.classList.add('ok'); }
  });
  var cta = document.getElementById('continue'); if (!cta) return;
  var tgt = first || firstAny; if (!tgt) { cta.hidden = true; return; }
  var started = false; document.querySelectorAll('section.pack').forEach(function (sec) { if (read(sec.getAttribute('data-key'))) started = true; });
  cta.href = tgt.href;
  cta.querySelector('.k').textContent = first ? (started ? 'Continue where you left off' : 'Start the course') : 'Everything is done. Start again from';
  cta.querySelector('.v').textContent = tgt.chapter + ' · ' + tgt.section;
  var tabs = document.querySelectorAll('.tabs a'); if (tabs.length) { function mark() { var h = location.hash; tabs.forEach(function (a) { a.classList.toggle('cur', a.getAttribute('href') === h); }); } mark(); window.addEventListener('hashchange', mark); }
})();
"""


def render_index(entries):
    """The course home page. Packs without a prerequisites chapter (the course itself) come first;
    company packs, which list generic chapters as prerequisites, follow as their own cards."""
    entries = sorted(entries, key=lambda e: (1 if any(c.get("kind") == "prereqs" for g in e["summary"]["groups"] for c in g["chapters"]) else 0))
    for e in entries:
        e["slug"] = re.sub(r"[^a-z0-9]+", "-", (e["pack"] + ("-" + e["round"] if e["round"] else "")).lower()).strip("-")
    multi = len(entries) > 1
    course_title = "Interview preparation" if multi or not entries else (entries[0]["summary"].get("meta", {}).get("title") or "Interview preparation")
    n_ch = sum(len(g["chapters"]) for e in entries for g in e["summary"]["groups"])
    n_sec = sum(len(c["sections"]) for e in entries for g in e["summary"]["groups"] for c in g["chapters"])
    n_ex = sum(c["exercises"] for e in entries for g in e["summary"]["groups"] for c in g["chapters"])
    n_tr = sum(len(e["summary"]["groups"]) for e in entries)
    parts = ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">',
             "<title>%s</title>" % esc(course_title),
             '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
             '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">',
             "<style>" + CSS + "</style>"]
    tabs = ""
    if multi:
        tabs = '<nav class="tabs" aria-label="Courses">%s</nav>' % "".join(
            '<a href="#pack-%s">%s</a>' % (esc(e["slug"]), esc(e["summary"].get("meta", {}).get("title") or e["pack"])) for e in entries)
    parts.append('<header class="top"><div class="top-inner"><a class="site" href="index.html">Interview prep</a>%s</div></header>' % tabs)
    parts.append('<main class="wrap">')
    parts.append('<div class="hero"><div class="eb">Course</div><h1>%s</h1><p>%s</p>'
                 '<div class="cta"><a class="btn" id="continue" href="#"><span><span class="k">Start the course</span><br><span class="v"></span></span>&rarr;</a>'
                 '<span class="stats"><b>%d</b> track%s &middot; <b>%d</b> chapters &middot; <b>%d</b> sections &middot; <b>%d</b> exercises</span></div></div>' % (
                     esc(course_title), esc(PROMISE), n_tr, "" if n_tr == 1 else "s", n_ch, n_sec, n_ex))
    parts.append('<div class="legend" aria-label="Legend">'
                 '<span class="lg"><span class="sw danger"></span> asked most often</span>'
                 '<span class="lg"><span class="sw warning"></span> asked regularly</span>'
                 '<span class="lg"><span class="sw good"></span> asked less often</span>'
                 '<span class="lg"><span class="tk">&#10003;</span> section you have marked as read</span>'
                 '<span class="lg"><span class="bar"><i style="width:60%"></i></span> how much of the chapter you have read</span></div>')
    if not entries:
        parts.append('<p class="stats">Nothing is built yet. Add a course under packs/ and run python engine/roadmap.py.</p>')
    for e in entries:
        parts.append(render_pack(e, len(entries)))
    parts.append("</main>")
    parts.append("<footer>Your progress is read from what this browser has saved. Open a chapter page once and it will show up here, or load a saved progress file on that page.</footer>")
    parts.append("<script>" + SCRIPT + "</script>")
    return ascii_only("\n".join(parts))


def main(argv):
    index_only = "--index" in argv
    entries = []
    for pack, rnd, rdir in rounds():
        if not index_only:
            build_round(rdir)
        page = page_name(pack, rnd)
        if not os.path.exists(os.path.join(DIST, page)):
            continue
        entries.append({"pack": pack, "round": rnd, "page": page, "summary": summarise(rdir)})
    os.makedirs(DIST, exist_ok=True)
    html = render_index(entries)
    with io.open(os.path.join(DIST, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("roadmap: %d pages -> dist/index.html" % len(entries))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
