from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'dist/manifest.json').read_text())
release = root / 'release'
release.mkdir(exist_ok=True)
target = release / f'vod-buttons-{manifest["version"]}.zip'
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in sorted((root / 'dist').rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(root / 'dist'))
print(f'Created {target.relative_to(root)}')
