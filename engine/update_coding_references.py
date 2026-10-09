"""Inject the readable executable references into the course (no runtime fetch)."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent.parent
target = ROOT / 'core/zzz-audit-coding.js'
text = target.read_text(encoding='utf-8')
start = text.index('  /* AUDIT_REFERENCE_SLOT */')
end_marker = '  /* AUDIT_REFERENCE_END */'
end = text.find(end_marker, start)
end = start + len('  /* AUDIT_REFERENCE_SLOT */') if end < 0 else end + len(end_marker)
py = (ROOT / 'engine/fixtures/feature_computer.py').read_text(encoding='utf-8')
sql = (ROOT / 'engine/fixtures/event_features.sql').read_text(encoding='utf-8')
top_k = (ROOT / 'engine/fixtures/top_k.py').read_text(encoding='utf-8')
insert = ('  /* AUDIT_REFERENCE_SLOT */\n'
          '  a1.model = "<p>Exact scan-based reference; inspect the policy before optimizing.</p>" + code(' + json.dumps(py) + ');\n'
          '  a4.model = "<p>Executable SQLite reference. PostgreSQL uses timestamp/interval types instead of UTC-second arithmetic; the cutoff/availability policy stays the same.</p>" + code(' + json.dumps(sql) + ');\n'
          '  a2.model += "<p>Executable exact reference; globally unique IDs are an upstream contract.</p>" + code(' + json.dumps(top_k) + ');\n'
          '  /* AUDIT_REFERENCE_END */')
target.write_text(text[:start] + insert + text[end:], encoding='utf-8')
