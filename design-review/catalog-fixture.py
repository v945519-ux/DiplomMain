import json, sqlite3
from pathlib import Path
root = Path(__file__).resolve().parent.parent
c = sqlite3.connect((root / 'config/db.sqlite3').as_uri() + '?mode=ro', uri=True)
c.row_factory = sqlite3.Row
products = [dict(r) for r in c.execute('SELECT p.id,p.name,p.slug,p.description,p.price,p.image,p.weight,p.is_available,p.is_popular,p.category_id AS category,c.name AS category_name FROM catalog_product p JOIN catalog_category c ON c.id=p.category_id WHERE p.is_available=1 ORDER BY p.name,p.id')]
for p in products:
    p['price'] = str(p['price'])
    p['is_popular'] = bool(p['is_popular'])
    p['is_available'] = bool(p['is_available'])
    p['image'] = 'http://127.0.0.1:8000/media/' + p['image'] if p['image'] else None
categories = [dict(r) for r in c.execute('SELECT id,name,slug,description,image,is_active FROM catalog_category WHERE is_active=1')]
for cat in categories:
    cat['products_count'] = sum(p['category'] == cat['id'] for p in products)
(root / 'design-review/catalog.json').write_text(json.dumps({'products':products,'categories':categories}, ensure_ascii=False), encoding='utf-8')
print('Catalog fixture:', len(products), 'products')


