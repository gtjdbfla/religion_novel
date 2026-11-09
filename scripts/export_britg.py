"""manuscripts/current 의 마크다운 원고를 브릿G 붙여넣기용 텍스트로 변환한다.

사용: python scripts/export_britg.py [시작화] [끝화]   (기본 1 10)
출력: britg/NN_<소제목>.txt (본문만), britg/INDEX.md (제목·글자수)
본문 변환과 소제목은 문피아 내보내기(export_munpia.py)와 같다. 원고 원본은 수정하지 않는다.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from export_munpia import MUNPIA_SUBTITLES, SRC, convert  # noqa: E402

OUT = Path(__file__).resolve().parent.parent / "britg"


def main() -> None:
    first = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    last = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    OUT.mkdir(exist_ok=True)
    rows = []
    for path in sorted(SRC.glob("[0-9][0-9][0-9]-*.md")):
        n = int(path.name[:3])
        if not first <= n <= last:
            continue
        title, text = convert(path.read_text(encoding="utf-8"))
        subtitle = MUNPIA_SUBTITLES.get(n, re.sub(r"^\d+화\.\s*", "", title))
        subtitle = re.sub(r'[<>:"/\\|?*]', "", subtitle).strip().rstrip(".")
        filename = f"{n:02d}_{subtitle}.txt"
        for old in OUT.glob(f"{n:02d}_*.txt"):
            if old.name != filename:
                old.unlink()
        (OUT / filename).write_text(text, encoding="utf-8")
        rows.append((n, subtitle, len(text.strip()), len(re.sub(r"\s", "", text)), filename))
    index = ["# 브릿G 등록용 회차 목록", "", "| 회차 | 소제목 | 공백 포함 | 공백 제외 | 본문 파일 |", "|---|---|---|---|---|"]
    index += [
        f"| {n} | {t} | {a:,} | {b:,} | {f} |"
        for n, t, a, b, f in rows
    ]
    (OUT / "INDEX.md").write_text("\n".join(index) + "\n", encoding="utf-8")
    print("\n".join(index))


if __name__ == "__main__":
    main()
