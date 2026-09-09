"""Build dist/index.html: a fan-out map of every pack -> chapter -> section, with deep links
into the built pages and per-chapter progress read from the browser's saved state.

Usage: python engine/roadmap.py            (scans packs/ and builds every round it finds, then the index)
       python engine/roadmap.py --index    (index only, from already-built pages)
"""
import io
import json
import os
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
try{new Function('window',fs.readFileSync(path.join(root,'core','library.js'),'utf8'))(w);}catch(e){}
new Function('window',fs.readFileSync(path.join(rdir,'content.js'),'utf8'))(w);
const ovp=path.join(rdir,'overlays.js'); if(fs.existsSync(ovp)) new Function('window',fs.readFileSync(ovp,'utf8'))(w);
const C=w.PREP_CONTENT; if(C.useCore&&w.PREP_CORE) C.useCore.forEach(id=>{ if(w.PREP_CORE[id]&&!C.topics.some(t=>t.id===id)) C.topics.push(JSON.parse(JSON.stringify(w.PREP_CORE[id])));});
const OV=w.PREP_OVERLAYS||C.overlays||{}; Object.keys(OV).forEach(id=>{const t=C.topics.find(x=>x.id===id); if(!t) return; const o=OV[id]||{}; if(o.learn){let lf=-1;t.learn.forEach((c,i)=>{if(c.part==='field')lf=i;}); o.learn.forEach((c,k)=>t.learn.splice(lf+1+k,0,c));} if(o.activities) t.activities=t.activities.concat(o.activities);});
const byId=Object.fromEntries(C.topics.map(t=>[t.id,t]));
const groups=(C.groups||[{id:'all',label:'Chapters',ids:C.topics.map(t=>t.id)}]).map(g=>({id:g.id,label:g.label,sub:g.sub||'',chapters:g.ids.filter(i=>byId[i]).map(i=>({id:i,title:byId[i].title,level:byId[i].level,levelLabel:byId[i].levelLabel,sections:byId[i].learn.map(c=>({id:c.id,title:c.title,part:c.part||''})),exercises:byId[i].activities.length,hasSay:!!byId[i].sayItOutLoud}))}));
console.log(JSON.stringify({meta:C.meta||{},interviewAt:C.interviewAt||null,hasInterviewer:!!C.interviewer,groups,glossary:!!(C.glossary&&C.glossary.length)}));
"""
    out = subprocess.check_output(["node", "-e", js, ROOT, rdir], encoding="utf-8")
    return json.loads(out)


def build_round(rdir):
    subprocess.check_call([sys.executable, os.path.join(ROOT, "engine", "build.py"), rdir])


def page_name(pack, rnd):
    return (pack + ("__" + rnd if rnd else "")) + ".html"


def render_index(entries):
    css = """
:root{--bg:#f2f4f8;--surface:#fff;--surface-2:#e8edf4;--surface-3:#d6dee9;--ink:#161b22;--ink-dim:#525c6b;--border:#d6dee9;--accent:#2454cc;--accent-weak:#e4ebfc;--accent-ink:#173c99;--good:#177a5c;--good-weak:#def3ea;--warning:#a3720a;--warning-weak:#fbf0d6;--danger:#c1402a;--danger-weak:#fbe7e2;--mono:ui-monospace,SFMono-Regular,Menlo,monospace;--sans:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0d131f;--surface:#141b2a;--surface-2:#1b2436;--surface-3:#28324a;--ink:#e8edf6;--ink-dim:#9fabc2;--border:#2a3550;--accent:#7ba1ff;--accent-weak:#1c2c52;--accent-ink:#c4d6ff;--good:#5fdcb0;--good-weak:#123526;--warning:#f2c463;--warning-weak:#3a2c0c;--danger:#ff8a6e;--danger-weak:#3a2013}}
:root[data-theme=dark]{--bg:#0d131f;--surface:#141b2a;--surface-2:#1b2436;--surface-3:#28324a;--ink:#e8edf6;--ink-dim:#9fabc2;--border:#2a3550;--accent:#7ba1ff;--accent-weak:#1c2c52;--accent-ink:#c4d6ff;--good:#5fdcb0;--good-weak:#123526;--warning:#f2c463;--warning-weak:#3a2c0c;--danger:#ff8a6e;--danger-weak:#3a2013}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:15px;line-height:1.5}
.wrap{max-width:1200px;margin:0 auto;padding:28px 20px 60px}h1{font-size:26px;margin:0 0 4px;letter-spacing:-.01em}.sub{color:var(--ink-dim);margin-bottom:22px}
.pack{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 22px;margin-bottom:22px}
.pack h2{margin:0;font-size:19px}.pack .eb{font-family:var(--mono);font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-dim)}
.pack .open{display:inline-block;margin:8px 0 14px;font-weight:600;color:var(--accent);text-decoration:none}.pack .open:hover{text-decoration:underline}
.tree{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.grp{border-left:3px solid var(--accent);padding-left:12px}.grp h3{margin:0 0 2px;font-size:12px;font-family:var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--accent-ink)}.grp .gs{color:var(--ink-dim);font-size:12px;margin-bottom:8px}
.ch{margin:0 0 10px}.ch a.t{font-weight:600;color:var(--ink);text-decoration:none}.ch a.t:hover{color:var(--accent)}
.pill{font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:.05em;padding:1px 7px;border-radius:999px;margin-left:6px;vertical-align:middle;border:1px solid transparent}
.pill.danger{background:var(--danger-weak);color:var(--danger)}.pill.warning{background:var(--warning-weak);color:var(--warning)}.pill.good{background:var(--good-weak);color:var(--good)}
.bar{height:4px;border-radius:2px;background:var(--surface-3);margin:4px 0 6px;overflow:hidden}.bar i{display:block;height:100%;width:0;background:var(--accent)}
.secs{list-style:none;margin:0;padding:0 0 0 2px}.secs li{font-size:12.5px;line-height:1.35;margin:2px 0;display:flex;gap:6px;align-items:baseline}.secs a{color:var(--ink-dim);text-decoration:none}.secs a:hover{color:var(--accent)}.secs .n{font-family:var(--mono);font-size:10px;color:var(--ink-dim);min-width:16px;text-align:right}.secs li.done a{color:var(--good)}.secs li.done .n{color:var(--good)}
.meta{font-family:var(--mono);font-size:11px;color:var(--ink-dim)}.foot{margin-top:30px;color:var(--ink-dim);font-size:12px;font-family:var(--mono)}
"""
    parts = ["<title>Interview prep roadmap</title><style>" + css + "</style><div class=wrap>",
             "<h1>Interview prep roadmap</h1><div class=sub>Every pack, chapter and section in one place. Ticks reflect what you have marked understood in each page (same browser). Click a section to jump straight to it.</div>"]
    for e in entries:
        m = e["summary"]["meta"]
        title = m.get("title") or e["pack"]
        eb = m.get("eyebrow") or e["pack"]
        parts.append('<section class=pack data-key="prep-state-%s-v1"><div class=eb>%s</div><h2>%s</h2><a class=open href="%s">Open the page &rarr;</a>' % (
            m.get("id", "pack"), eb, title, e["page"]))
        parts.append("<div class=tree>")
        for g in e["summary"]["groups"]:
            parts.append('<div class=grp><h3>%s</h3><div class=gs>%s</div>' % (g["label"], g.get("sub", "")))
            for ch in g["chapters"]:
                parts.append('<div class=ch data-topic="%s"><a class=t href="%s#%s">%s</a><span class="pill %s">%s</span><div class=bar><i></i></div><ul class=secs>' % (
                    ch["id"], e["page"], ch["id"], ch["title"], ch["level"], ch["levelLabel"]))
                for i, sec in enumerate(ch["sections"]):
                    parts.append('<li data-sec="%s"><span class=n>%d</span><a href="%s#%s/%s">%s</a></li>' % (sec["id"], i + 1, e["page"], ch["id"], sec["id"], sec["title"]))
                parts.append('<li><span class=n>&middot;</span><a href="%s#%s">Exercises (%d)%s</a></li></ul></div>' % (
                    e["page"], ch["id"], ch["exercises"], " and spoken answer" if ch["hasSay"] else ""))
            parts.append("</div>")
        parts.append("</div></section>")
    parts.append("<div class=foot>Built by engine/roadmap.py. Progress is read from this browser's saved page state; open a page once to see its ticks here.</div></div>")
    parts.append("""<script>
(function(){document.querySelectorAll('section.pack').forEach(function(sec){var st=null;try{st=JSON.parse(localStorage.getItem(sec.getAttribute('data-key'))||'null');}catch(e){}if(!st||!st.topics)return;sec.querySelectorAll('.ch').forEach(function(ch){var t=st.topics[ch.getAttribute('data-topic')];if(!t)return;var lis=ch.querySelectorAll('li[data-sec]');var done=0;lis.forEach(function(li){if(t.learn&&t.learn[li.getAttribute('data-sec')]){li.classList.add('done');done++;}});var bar=ch.querySelector('.bar i');if(bar&&lis.length)bar.style.width=Math.round(100*done/lis.length)+'%';});});})();
</script>""")
    return "\n".join(parts)


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
    io.open(os.path.join(DIST, "index.html"), "w", encoding="utf-8").write(html)
    print("roadmap: %d pages -> dist/index.html" % len(entries))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
