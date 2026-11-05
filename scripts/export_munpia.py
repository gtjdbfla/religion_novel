"""manuscripts/current 의 마크다운 원고를 문피아 붙여넣기용 텍스트로 변환한다.

사용: python scripts/export_munpia.py [시작화] [끝화]   (기본 1 3)
출력: munpia/NNN-<slug>.txt (본문만), munpia/INDEX.md (제목·글자수)
원고 원본은 수정하지 않는다.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "manuscripts" / "current"
OUT = ROOT / "munpia"
BREAK = "* * *"


def convert(md: str) -> tuple[str, str]:
    lines = md.strip().splitlines()
    title = re.sub(r"^#\s*", "", lines[0]).strip()
    body = []
    for line in lines[1:]:
        line = line.rstrip()
        if line.strip() in ("---", "⸻"):
            line = BREAK
        line = re.sub(r"^>\s?", "", line)
        line = line.replace("**", "")
        body.append(line)
    text = "\n".join(body).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return title, text + "\n"


def main() -> None:
    first = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    last = int(sys.argv[2]) if len(sys.argv) > 2 else 3
    OUT.mkdir(exist_ok=True)
    rows = []
    for path in sorted(SRC.glob("[0-9][0-9][0-9]-*.md")):
        n = int(path.name[:3])
        if not first <= n <= last:
            continue
        title, text = convert(path.read_text(encoding="utf-8"))
        (OUT / f"{path.stem}.txt").write_text(text, encoding="utf-8")
        rows.append((title, len(text.strip()), len(re.sub(r"\s", "", text)), path.stem))
    index = ["# 문피아 등록용 회차 목록", "", "| 회차 제목 | 공백 포함 | 공백 제외 | 본문 파일 |", "|---|---|---|---|"]
    index += [f"| {t} | {a:,} | {b:,} | {s}.txt |" for t, a, b, s in rows]
    (OUT / "INDEX.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print("\n".join(index))


if __name__ == "__main__":
    main()
