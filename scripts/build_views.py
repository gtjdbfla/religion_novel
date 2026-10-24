import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def build():
    config = json.loads((ROOT / 'story_bible/project.json').read_text(encoding='utf-8'))
    manuscripts = []
    for path in sorted((ROOT / 'manuscripts/current').glob('*.md')):
        if path.name == 'README.md':
            continue
        lines = path.read_text(encoding='utf-8').strip().splitlines()
        if not lines or not lines[0].startswith('# '):
            raise ValueError(f'{path.name}: 첫 줄에 제목이 필요합니다.')
        text = '\n'.join(lines[1:]).strip()
        if not text:
            raise ValueError(f'{path.name}: 본문이 비어 있습니다.')
        manuscripts.append(dict(id=path.stem, title=lines[0][2:], text=text, characters=len(text)))
    public = dict(title=config['title'], audience='reader', premise=config['premise'],
                  characters=config['publicCharacters'], manuscripts=manuscripts)
    data_dir = ROOT / 'site/data'
    data_dir.mkdir(exist_ok=True)
    (data_dir / 'project.json').write_text(json.dumps(public, ensure_ascii=False, indent=2), encoding='utf-8')
    author_dir = ROOT / 'author-site'
    shutil.copytree(ROOT / 'site', author_dir, dirs_exist_ok=True)
    author = dict(config, audience='author', manuscripts=manuscripts)
    (author_dir / 'data/project.json').write_text(json.dumps(author, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'공개 원고 {len(manuscripts)}편 · {config["structure"]} · 독자/작가 화면 생성 완료')
    return public, author

if __name__ == '__main__':
    build()
