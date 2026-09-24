"""Create a source-only assessment ZIP using an explicit include list."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
output = root / 'artifacts' / 'community-events-source.zip'
files = [
    'README.md', 'LICENSE', 'package.json', 'package-lock.json', 'app.json',
    'tsconfig.json', 'jest.config.js', 'eslint.config.js', 'playwright.config.ts',
    '.env.example', '.gitignore', '.prettierrc.json', '.prettierignore',
    'scripts/package-source.py',
]
for folder in ['src', 'assets', 'docs', 'e2e']:
    files.extend(str(p.relative_to(root)) for p in (root / folder).rglob('*')
                 if p.is_file() and not any(part.startswith('.') for part in p.relative_to(root).parts))
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for name in sorted(files):
        archive.write(root / name, 'community-events/' + name)
print(f'Created {output.relative_to(root)} ({len(files)} files)')
