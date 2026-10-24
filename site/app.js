import { renderProse } from './prose.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const params = new URLSearchParams(location.search);
let view = params.get('view') || 'read';
let chapter = params.get('chapter') || '';
let project;
const main = document.querySelector('#main');
const card = (title, text) => `<article class="setting-card"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
const head = (kicker, title, description) => `<header class="analysis-head"><span>${esc(kicker)}</span><h1>${esc(title)}</h1><p>${esc(description)}</p></header>`;
const list = items => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
function read() {
  if (!project.manuscripts.length) return head('MANUSCRIPT', project.title, project.premise) + `<section class="empty-state"><span class="empty-mark">印</span><h2>첫 원고를 기다리는 중</h2><p>현재는 작품을 설계하는 단계입니다.<br>원고가 등록되면 이곳에서 회차별로 읽을 수 있습니다.</p></section>`;
  const current = project.manuscripts.find(item => item.id === chapter) || project.manuscripts[0];
  const index = project.manuscripts.indexOf(current);
  return head('MANUSCRIPT', project.title, '목차에서 원하는 회차를 선택하세요.') + `<nav class="chapter-index" aria-label="회차 목차">${project.manuscripts.map(item => `<button data-chapter="${esc(item.id)}" class="${item === current ? 'active' : ''}">${esc(item.title)}</button>`).join('')}</nav><article class="chapter-reader"><section class="chapter"><header><span>${index + 1} · ${current.characters.toLocaleString()}자</span><h2>${esc(current.title)}</h2></header><div class="reader-body">${renderProse(current.text)}</div></section><nav class="chapter-controls"><button data-chapter="${esc(project.manuscripts[index - 1]?.id)}" ${index === 0 ? 'disabled' : ''}>← 이전화</button><button data-top>목차로 ↑</button><button data-chapter="${esc(project.manuscripts[index + 1]?.id)}" ${index === project.manuscripts.length - 1 ? 'disabled' : ''}>다음화 →</button></nav></article>`;
}
function characters() {
  return head('CHARACTERS', '이야기를 움직이는 사람들', '실존 인물과 창작 인물을 구분합니다. 소개는 작품 도입부를 기준으로 합니다.') + `<div class="setting-grid">${project.characters.map(p => card(`${p.name} · ${p.type}`, p.summary)).join('')}</div>`;
}
function partOnePanel() {
  const part = project.partOne;
  if (!part) return '';
  return `<section class="bible-panel" id="part-one"><header><span>PART ONE · ${esc(part.source)}</span><h2>${esc(part.title)} · ${esc(part.range)}</h2></header><p>${esc(part.premise)}</p><p><b>종합 검토</b> ${esc(part.review.overall)} · ${esc(part.review.summary)}</p><div class="chapter-plan-grid">${part.episodes.map(ep => `<article class="chapter-plan-card"><header><span>${esc(ep.status)} · 기록 수 ${esc(ep.count)}</span><h3>${ep.number}화 《${esc(ep.title)}》</h3></header><p><b>회차 역할</b> ${esc(ep.role)}</p><p><b>핵심 사건</b> ${esc(ep.event)}</p><p><b>요한</b> ${esc(ep.johann)}</p><p><b>루터</b> ${esc(ep.luther)}</p><p><b>연결 논제</b> ${esc(ep.theses)}</p><p><b>집필 점검</b> ${esc(ep.check)}</p></article>`).join('')}</div><details><summary>1부 설정·개연성 검토와 남은 결정</summary><div class="setting-grid">${part.review.categories.map(item => card(`${item.status} · ${item.name}`, item.note)).join('')}</div>${part.review.issues.map(item => `<article class="setting-card"><h3>${esc(item.title)}</h3><p>${esc(item.note)}</p><p><b>결정할 것</b> ${esc(item.decision)}</p></article>`).join('')}</details><details><summary>${esc(part.nextPartOpening.episode)} 시작 장면 · ${esc(part.nextPartOpening.status)}</summary><p>${esc(part.nextPartOpening.event)}</p></details></section>`;
}
function storyline() {
  return head(`STORY BIBLE · ${project.version}`, '누가 역사를 만드는가', `사용자 제공 발전안 기준 · ${project.structure} · ${project.manuscripts.length}편 등록 · 1부 1–8화 세분화 · 미집필 구간은 계획`) + `<section class="bible-panel"><h2>현재 이야기의 출발점</h2><p>${esc(project.storyPremise)}</p><p><b>작품의 중심</b> ${esc(project.theme)}</p><details><summary>이전 버전에서 바뀐 점</summary>${list(project.revisionNotes)}</details></section><section class="bible-panel"><h2>이야기의 흐름</h2><div class="chain-stack"><article class="chain-card"><ol>${project.chain.map(s => `<li>${esc(s)}</li>`).join('')}</ol></article></div></section>${partOnePanel()}<section class="section-title"><h2>전체 10부와 프롤로그·에필로그</h2></section><div class="chapter-plan-grid">${project.parts.map(p => `<article class="chapter-plan-card"><header><span>${esc(p.period)} · ${esc(project.chapterProgress?.[p.label] || '계획')}</span><h3>${esc(p.label)} — ${esc(p.title)}</h3></header><p><b>중심 질문</b> ${esc(p.question)}</p><p><b>핵심 사건</b> ${esc(p.event)}</p><p><b>요한의 변화</b> ${esc(p.johann)}</p><p><b>루터의 변화</b> ${esc(p.luther)}</p><p><b>집필 점검</b> ${esc(p.check)}</p></article>`).join('')}</div>`;
}
function settings() {
  return head('CHARACTER & WORLD', '인물과 설정', '현재 확정된 방향과 아직 결정하지 않은 선택지를 함께 관리합니다.') + `<section class="bible-panel"><h2>집필의 기준</h2>${list(project.rules)}</section><div class="arc-grid">${project.arcs.map(p => `<article class="arc-card"><h3>${esc(p.name)}</h3><dl><dt>출발점</dt><dd>${esc(p.start)}</dd><dt>변화</dt><dd>${esc(p.change)}</dd><dt>마지막 질문</dt><dd>${esc(p.end)}</dd></dl></article>`).join('')}</div><section class="bible-panel"><h2>미정 사항</h2>${list(project.openQuestions)}</section>`;
}
function foreshadowing() {
  return head('MOTIFS & PAYOFFS', '반복되는 말과 사물', '계획한 복선과 원고에서 실제로 심은 복선을 구분합니다. 실제 원고에서 확인된 표현만 심음으로 표시합니다.') + `<div class="foreshadow-grid">${project.motifs.map(p => `<article class="foreshadow-card"><header><span class="state-badge warn">${esc(p.status || '심기 전')}</span><h3>${esc(p.title)}</h3></header><dl><dt>처음</dt><dd>${esc(p.seed)}</dd><dt>반복 / 회수 계획</dt><dd>${esc(p.payoff)}</dd><dt>의미</dt><dd>${esc(p.meaning)}</dd></dl>${p.verify?.length ? `<div class="method-note"><b>원고 근거</b>${list(p.verify.map(v => `${v.chapter} · ${v.quote}`))}</div>` : ''}</article>`).join('')}</div>`;
}
function history() {
  return head('RESEARCH LEDGER', '고증 기록', '창작 설정과 조사 항목을 구분합니다. 일부 자료를 확인한 항목도 남은 조사 범위를 함께 기록합니다.') + `<div class="setting-grid">${project.research.map(p => `<article class="setting-card"><span class="state-badge ${p.kind === '창작' ? 'info' : 'warn'}">${esc(p.kind)}</span><h3>${esc(p.title)}</h3><p>${esc(p.note)}</p><dl><dt>출처 / 상태</dt><dd>${esc(p.source)}</dd><dt>확인할 것</dt><dd>${esc(p.next)}</dd></dl>${p.sources ? `<ul>${p.sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a></li>`).join('')}</ul>` : ''}</article>`).join('')}</div>`;
}
function analysis() {
  const reviews = project.chapterReviews || [];
  const reviewed = project.manuscripts.filter(ch => reviews.some(r => r.id === ch.id));
  const reviewCards = project.manuscripts.map(ch => {
    const r = reviews.find(r => r.id === ch.id);
    if (!r) return card(ch.title, `${ch.characters.toLocaleString()}자 · 검토 대기`);
    return `<section class="bible-panel"><header><span>${esc(r.reviewedAt)} · ${esc(r.basis)}</span><h2>${esc(ch.title)} · ${esc(r.overall)}</h2></header><p>${esc(r.summary)}</p><p>${ch.characters.toLocaleString()}자 · 본문 원문 기준, 공백·줄바꿈·서식기호 포함</p><div class="setting-grid">${r.categories.map(category => `<article class="setting-card"><span class="state-badge ${category.status === 'O' ? 'pass' : category.status === 'X' ? 'fail' : 'warn'}">${esc(category.status)}</span><h3>${esc(category.name)}</h3><p>${esc(category.assessment)}</p><div class="method-note"><b>원고 근거</b><p>${esc(category.evidence)}</p></div></article>`).join('')}</div><h3>확인·보강할 부분</h3><div class="setting-grid">${r.issues.map(item => card(item.title,item.note)).join('')}</div><h3>다음 화 점검</h3>${list(r.nextChecks)}</section>`;
  }).join('');
  return head('AUTHOR REVIEW', '원고 검토', 'O: 현재 설정과 부합 · △: 확인·보강할 부분 · X: 명확한 충돌. 고증 확인 대기는 원고 수정 확정과 구분합니다.') + `<section class="metric-grid"><article><span>MANUSCRIPTS</span><b>${project.manuscripts.length}편</b><p>현재 등록 원고</p></article><article><span>STRUCTURE</span><b>${esc(project.structure)}</b><p>1부 도입 집필 중</p></article><article><span>REVIEW</span><b>${reviewed.length}편 검토</b><p>원고 근거와 다음 점검 기록</p></article><article><span>RESEARCH</span><b>확인 중</b><p>고증 전체 통과 판정 아님</p></article></section>${reviewCards || '<section class="bible-panel"><p>검토할 원고가 없습니다.</p></section>'}<section class="bible-panel"><h2>실제 95개조와의 연결</h2><p>${esc(project.writingDirection || '')}</p><div class="setting-grid">${(project.thesisLinks || []).map(item => card(`${item.chapter} · ${item.number} · ${item.status}`, `${item.memo} — ${item.relation}`)).join('')}</div></section><section class="bible-panel"><h2>원고에서 확정된 생활·지식 상태</h2>${list((project.manuscriptFacts || []).map(item => `${item.chapter} · ${item.fact} (근거: ${item.evidence})`))}</section><section class="bible-panel"><h2>회차마다 확인할 것</h2>${list(project.reviewChecklist)}</section>`;
}
function development() {
  return head('DEVELOPMENT REVIEW', '다음으로 발전시킬 부분', '제공된 발전안에 대한 편집 의견입니다. 이전 의견 중 해결된 항목과 아직 남은 제안을 나눠 기록합니다. 남은 제안은 사건에 자동 반영하지 않았습니다.') + `<section class="bible-panel"><h2>이번 버전의 강점</h2><p>${esc(project.strengths)}</p></section><section class="bible-panel"><h2>이번 버전에서 해결한 검토 항목</h2><div class="setting-grid">${project.resolvedReview.map(item => card(item.title, item.resolution)).join('')}</div></section><div class="chapter-plan-grid">${project.developmentReview.map(item => `<article class="chapter-plan-card"><header><span>${esc(item.priority)} · 미채택 검토 의견 · ${esc(item.related)}</span><h3>${esc(item.title)}</h3></header><p><b>현재 진단</b> ${esc(item.finding)}</p><p><b>발전 제안</b> ${esc(item.suggestion)}</p><p><b>결정할 질문</b> ${esc(item.decision)}</p></article>`).join('')}</div>`;
}
function render() {
  const author = project.audience === 'author';
  document.querySelector('footer span:last-child').textContent = author ? `STORY BIBLE ${project.version}` : 'NOVEL PROJECT';
  const entries = [['read','글 읽기'],['characters','등장인물'], ...(author ? [['storyline','스토리라인'],['development','발전 검토'],['settings','인물·설정'],['foreshadowing','복선'],['history','고증 기록'],['analysis','원고 검토']] : [])];
  if (!entries.some(([id]) => id === view)) view = 'read';
  document.querySelector('#navigation').innerHTML = entries.map(([id,label],i) => `<button data-view="${id}" class="${id === view ? 'active' : ''}" ${id === view ? 'aria-current="page"' : ''}><span>${String(i+1).padStart(2,'0')}</span>${label}</button>`).join('');
  document.querySelector('#breadcrumb').textContent = entries.find(([id]) => id === view)[1];
  document.querySelector('#mode-badge').textContent = author ? 'AUTHOR' : 'READER';
  const link = document.querySelector('#mode-link');
  link.textContent = author ? '독자 화면' : '작가 화면';
  const local = ['localhost', '127.0.0.1'].includes(location.hostname);
  link.href = local
    ? `http://${location.hostname}:${author ? 8101 : 8102}/`
    : new URL(author ? '../' : 'admin/', location.href).href;
  main.innerHTML = ({read,characters,storyline,development,settings,foreshadowing,history,analysis})[view]();
  const next = new URLSearchParams({view});
  if (view === 'read' && chapter) next.set('chapter', chapter);
  window.history.replaceState(null,'',`${location.pathname}?${next}`);
}
document.addEventListener('click', e => {
  const button = e.target.closest('button');
  if (!button || button.disabled) return;
  if (button.dataset.view) { view = button.dataset.view; render(); window.scrollTo(0,0); }
  if (button.dataset.chapter) { chapter = button.dataset.chapter; render(); window.scrollTo(0,0); }
  if (button.hasAttribute('data-top')) window.scrollTo({top:0,behavior:'smooth'});
});
try {
  const response = await fetch('./data/project.json');
  if (!response.ok) throw new Error('자료를 불러오지 못했습니다.');
  project = await response.json(); render();
} catch (error) { main.innerHTML = `<section class="empty-state"><h1>기록을 열 수 없습니다</h1><p>${esc(error.message)}</p></section>`; }
