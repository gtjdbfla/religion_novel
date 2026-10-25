# 원문 — 39화 집필 대시보드

활성 집필안: `story_bible/OUTLINE_39.txt` (10부+에필로그, 39화). 1부 1–6화, 2부 7–10화와 3부 11–13화를 등록했으며 14–39화는 계획이다. 13화는 부수·독자·언어·저자 확인을 보강했고 제공본도 보관했다. 12화는 실제 제목·축약·승인 과정을 보강했으며 제공본도 보관했다. 11화는 사용자 요청으로 인물·노동·인쇄 동작을 보강했고 취업 시점에 맞춰 12화 계획도 조정했다. 9·10화는 사용자 요청으로 연속성과 동기를 보강했고 수정 전 원고도 보관했다. 4·5화는 사용자 요청으로 보강했고 6화는 사용자 원문을 유지했다. 대시보드 19화 계획은 4화의 아버지 문해력에 맞춰 조정했다. 원본 전체안과 이전 원고·검토는 보관 자료이며 현재 회차와 혼용하지 않는다.

사용자 요청으로 독자 모드를 없앴다. 기본 주소와 기존 `/admin/` 주소 모두 동일한 작가 대시보드다. 글 읽기·등장인물·스토리라인·발전 검토·인물 설정·복선·고증 기록·원고 검토를 제공한다. 등장인물의 역할·목표·갈등·관계·변화와 확정/미정을 함께 표시한다. 원고는 수정하지 않는다.

- 기본: https://yulmserver.tail261e6c.ts.net:10000/religion/
- 기존 주소 호환: https://yulmserver.tail261e6c.ts.net:10000/religion/admin/
- 홈: https://yulmserver.tail261e6c.ts.net:10000/

## 실행과 검증

```powershell
python scripts/build_views.py
python scripts/serve.py
python -m unittest discover -s tests
node --check site/app.js
node --test tests/prose.test.mjs
```

로컬 기본 주소는 http://127.0.0.1:8101/ 이다. `--author` 실행기(8102)도 같은 내용을 제공하며 이전 주소를 유지하기 위한 호환 옵션이다. 빌드는 `site/`와 `author-site/`에 동일한 전체 데이터를 생성한다. 개요를 완성 원고로 만들거나 점수를 자동 부여하지 않는다.

## 홈서버

체크아웃 `/home/yulimseo/religion_novel`, Docker 서비스 `religion-novel`, 로컬 백엔드 8101/8102. 기존 Tailscale Funnel의 `/religion`과 `/religion/admin` 경로를 유지한다.

```sh
cd /home/yulimseo/religion_novel
git pull --ff-only
python3 scripts/build_views.py
docker compose up -d
```

초기 경로 등록 명령:

```sh
tailscale funnel --bg --yes --https=10000 --set-path=/religion http://127.0.0.1:8101
tailscale funnel --bg --yes --https=10000 --set-path=/religion/admin http://127.0.0.1:8102
```

현재 원고: `manuscripts/current/`. 이전 원고: `manuscripts/archive/`. 사용자 원안·기준 데이터·검토는 `story_bible/`에 보관한다. 원문 문서 자체는 웹 루트로 복사하지 않는다.
