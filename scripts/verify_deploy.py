"""push 후 홈서버에 원고가 실제로 반영됐는지 확인한다.

서버 cron(deploy.sh)은 10분마다 돌아서 push 직후에는 옛 내용이 보인다.
로컬 site/data/project.json 과 서버 data/project.json 의 원고 본문이 같아질 때까지 기다린다.

사용: python scripts/verify_deploy.py [최대대기분=15]
종료 코드: 0 일치, 1 시간 초과(불일치), 2 서버 접속 실패
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL = "https://yulmserver.tail261e6c.ts.net:10000/religion/data/project.json"


def texts(data: dict) -> dict:
    return {m["id"]: m["text"] for m in data["manuscripts"]}


def fetch() -> dict:
    with urllib.request.urlopen(URL, timeout=15) as r:
        return json.load(r)


def main() -> int:
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 15
    local = texts(json.loads((ROOT / "site/data/project.json").read_text(encoding="utf-8")))
    deadline = time.time() + limit * 60
    while True:
        try:
            remote = texts(fetch())
        except Exception as e:  # 네트워크·서버 오류
            print(f"서버 접속 실패: {e}")
            return 2
        stale = sorted(k for k in local if remote.get(k) != local[k])
        if not stale:
            print("서버 반영 확인: 로컬과 원고 본문이 모두 일치")
            return 0
        if time.time() > deadline:
            print("시간 초과. 서버에 아직 옛 내용인 회차:", ", ".join(stale))
            return 1
        time.sleep(30)


if __name__ == "__main__":
    sys.exit(main())
