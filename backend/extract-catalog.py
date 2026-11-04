"""Read a supplied workbook without modifying it or exporting personal columns.
Usage: python backend/extract-catalog.py path/to/source.xlsx (requires openpyxl).
"""
import json
import sys
from pathlib import Path
import openpyxl

workbook = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)
allowed = {"Мультсериалы и аниме", "Сериалы", "Все просмотренное", "Утерянные записи"}
data = {}
for sheet in workbook:
    name = sheet.title.strip()
    if name.startswith("Фильмы") or name in allowed:
        rows = sheet.values
        next(rows, None)
        data[name] = [str(row[1]).strip() for row in rows if len(row) > 1 and row[1]]
workbook.close()
target = Path(__file__).parent / ".state" / "workbook-titles.json"
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print({name: len(rows) for name, rows in data.items()})
