"""manuscripts/current 의 마크다운 원고를 문피아 붙여넣기용 텍스트로 변환한다.

사용: python scripts/export_munpia.py [시작화] [끝화]   (기본 1 3)
출력: munpia/<회차>화_<소제목>.txt (본문만), munpia/INDEX.md (제목·글자수)
원고 원본은 수정하지 않는다.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "manuscripts" / "current"
OUT = ROOT / "munpia"
BREAK = "* * *"
# 문피아에 올리는 소제목. 원고 파일의 회차 제목(대시보드·개요용)과 따로 관리한다. 없는 회차는 원고 제목을 쓴다.
MUNPIA_SUBTITLES = {
    1: "영웅은 그날도 술을 마시고 있었다",
    2: "질문은 하루에 네 개까지",
    3: "동전이 궤짝에 떨어지면",
    4: "아버지가 소를 팔았다",
    6: "아흔다섯 번째 문장",
    8: "이거 더 팔리겠는데",
    9: "훨씬 좋은 이야기",
}


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
        subtitle = re.sub(r"^\d+화\.\s*", "", title)
        subtitle = MUNPIA_SUBTITLES.get(n, subtitle)
        filename_title = re.sub(r'[<>:"/\\|*]', "", subtitle.replace("?", "？")).strip().rstrip(".")
        filename = f"{n}화_{filename_title}.txt"
        subtitle = re.sub(r'[<>:"/\\|?*]', "", subtitle).strip().rstrip(".")
        for old in OUT.glob(f"{n}화_*.txt"):
            if old.name != filename:
                old.unlink()
        (OUT / filename).write_text(text, encoding="utf-8")
        rows.append((n, subtitle, len(text.strip()), len(re.sub(r"\s", "", text)), filename))
    index = ["# 문피아 등록용 회차 목록", "", "| 회차 | 문피아 소제목 | 공백 포함 | 공백 제외 | 본문 파일 |", "|---|---|---|---|---|"]
    index += [
        f"| {n} | {title} | {with_spaces:,} | {without_spaces:,} | {filename} |"
        for n, title, with_spaces, without_spaces, filename in rows
    ]
    (OUT / "INDEX.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print("\n".join(index))


if __name__ == "__main__":
    main()
