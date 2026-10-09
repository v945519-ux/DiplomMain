import sqlite3,json
from pathlib import Path
root=Path('E:/pggggg12')
c=sqlite3.connect((root/'config/db.sqlite3').as_uri()+'?mode=ro',uri=True)
c.row_factory=sqlite3.Row
rows=[dict(r) for r in c.execute('select id,name,image from catalog_product where is_available=1')]
missing=[r for r in rows if not r['image'] or not (root/'config/media'/r['image']).is_file()]
(root/'design-review/image-audit.json').write_text(json.dumps({'total':len(rows),'missing':missing},ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'total':len(rows),'missing':missing},ensure_ascii=True))
