# 활자와 망치 (가제)

인쇄공 소년 요한이 말의 전파와 책임을 목격하는 종교개혁 역사소설의 대시보드. 기존 `gtjdbfla/fullmetal_alchemist`의 화면 스타일을 재사용하고, 이 작품 전용 화면과 데이터를 작성했다.

## 실행

Python 3만 있으면 빌드·실행할 수 있다. 프런트엔드는 별도 설치 없이 동작하는 HTML/CSS/JavaScript다.

```powershell
python scripts/build_views.py
python scripts/serve.py
```

독자 화면: http://127.0.0.1:8101/

별도 터미널에서 작가 화면을 실행한다.

```powershell
python scripts/serve.py --author
```

작가 화면: http://127.0.0.1:8102/

## 구성

- 독자: 글 읽기, 도입부 기준 등장인물
- 작가: 스토리라인, 인물·설정, 복선, 고증 기록, 원고 검토
- `story_bible/ORIGINAL_OUTLINE.txt`: 사용자 제공 개요 원문
- `story_bible/project.json`: 9부+에필로그 계획과 대시보드 기준 데이터
- `manuscripts/current/`: 현재 원고. 첫 줄 `# 제목`, 다음 줄부터 본문
- `site/`: 독자용 정적 파일. 빌드 시 공개용 데이터만 포함
- `author-site/`: 빌드로 생성하는 작가용 정적 파일, Git 제외

현재 완성 원고는 0편이다. 개요를 본문으로 표시하거나 검토 점수를 자동 생성하지 않는다. 제목·요한의 이름은 가칭이며 고증 기록은 외부 사료 검증 전 조사 목록이다. 구체적 집필 계획과 결말은 독자용 JSON에서 제외한다.

## 검증

```powershell
python -m unittest discover -s tests
node --check site/app.js
```

## 서버 배포

공개용 웹 루트에는 `site/`만 올린다. 저장소 전체나 `author-site/`를 공개 웹 루트로 제공하지 않는다. 작가 화면은 로컬 또는 인증을 적용한 별도 호스트에서 제공한다. 현재 실행기는 로컬 주소에만 바인딩된다. 작가/독자 전환 링크는 로컬 포트 기준이므로 서버 배포 시 실제 주소로 조정해야 한다.

이 GitHub 저장소는 공개 저장소이므로 `story_bible/`에 커밋된 설정과 결말은 GitHub에서 열람할 수 있다. 독자 화면의 데이터 분리는 저장소 접근 제어와 별개다.

## 홈서버 배포

- 독자: https://yulmserver.tail261e6c.ts.net:10000/religion/
- 작가: https://yulmserver.tail261e6c.ts.net:10000/religion/admin/
- 서버 체크아웃: `/home/yulimseo/religion_novel`
- 컨테이너: `religion-novel` (Caddy, 재부팅 후 자동 재시작)
- 로컬 백엔드: `127.0.0.1:8101`, `127.0.0.1:8102`

기존 강연금과 동일한 Tailscale Funnel 경로 방식으로 제공한다. 작가 URL에도 별도 로그인은 없으며, 작가 데이터는 해당 주소에서 열람 가능하다.

초기 설치는 서버에서 clone 후 아래 명령을 실행한다. 기존 Funnel 경로는 유지하고 새 경로만 추가한다.

```sh
cd /home/yulimseo/religion_novel
python3 scripts/build_views.py
docker compose run --rm --no-deps religion-novel caddy validate --config /etc/caddy/Caddyfile
docker compose up -d
tailscale serve --bg --yes --https=10000 --set-path=/religion http://127.0.0.1:8101
tailscale serve --bg --yes --https=10000 --set-path=/religion/admin http://127.0.0.1:8102
```

이후 업데이트는 `git pull --ff-only`, `python3 scripts/build_views.py`, `docker compose up -d` 순으로 실행한다. 설정 변경 시 `docker compose exec religion-novel caddy reload --config /etc/caddy/Caddyfile`도 실행한다.
