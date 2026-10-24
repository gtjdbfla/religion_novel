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
  return head('MANUSCRIPT', project.title, '목차에서 원하는 회차를 선택하세요.') + `<nav class="chapter-index" aria-label="회차 목차">${project.manuscripts.map(item => `<button data-chapter="${esc(item.id)}" class="${item === current ? 'active' : ''}">${esc(item.title)}</button>`).join('')}</nav><article class="chapter-reader"><section class="chapter"><header><span>${index + 1} · ${current.characters.toLocaleString()}자</span><h2>${esc(current.title)}</h2></header><div class="reader-body">${current.text.split(/\n\s*\n/).map(p => `<p>${esc(p)}</p>`).join('')}</div></section><nav class="chapter-controls"><button data-chapter="${esc(project.manuscripts[index - 1]?.id)}" ${index === 0 ? 'disabled' : ''}>← 이전화</button><button data-top>목차로 ↑</button><button data-chapter="${esc(project.manuscripts[index + 1]?.id)}" ${index === project.manuscripts.length - 1 ? 'disabled' : ''}>다음화 →</button></nav></article>`;
}
function characters() {
  return head('CHARACTERS', '이야기를 움직이는 사람들', '실존 인물과 창작 인물을 구분합니다. 소개는 작품 도입부를 기준으로 합니다.') + `<div class="setting-grid">${project.characters.map(p => card(`${p.name} · ${p.type}`, p.summary)).join('')}</div>`;
}
function storyline() {
  return head('STORY BIBLE · 1.0', '누가 역사를 만드는가', '사용자 제공 개요 기준 · 9부 + 에필로그 · 회차 수는 미정 · 모든 구성은 집필 전 계획') + `<section class="bible-panel"><h2>이야기의 흐름</h2><div class="chain-stack"><article class="chain-card"><ol>${project.chain.map(s => `<li>${esc(s)}</li>`).join('')}</ol></article></div></section><div class="chapter-plan-grid">${project.parts.map(p => `<article class="chapter-plan-card"><header><span>${esc(p.period)} · 계획</span><h3>${esc(p.label)} — ${esc(p.title)}</h3></header><p><b>중심 질문</b> ${esc(p.question)}</p><p><b>핵심 사건</b> ${esc(p.event)}</p><p><b>요한의 변화</b> ${esc(p.johann)}</p><p><b>루터의 변화</b> ${esc(p.luther)}</p><p><b>집필 점검</b> ${esc(p.check)}</p></article>`).join('')}</div>`;
}
function settings() {
  return head('CHARACTER & WORLD', '인물과 설정', '현재 확정된 방향과 아직 결정하지 않은 선택지를 함께 관리합니다.') + `<section class="bible-panel"><h2>집필의 기준</h2>${list(project.rules)}</section><div class="arc-grid">${project.arcs.map(p => `<article class="arc-card"><h3>${esc(p.name)}</h3><dl><dt>출발점</dt><dd>${esc(p.start)}</dd><dt>변화</dt><dd>${esc(p.change)}</dd><dt>마지막 질문</dt><dd>${esc(p.end)}</dd></dl></article>`).join('')}</div><section class="bible-panel"><h2>미정 사항</h2>${list(project.openQuestions)}</section>`;
}
function foreshadowing() {
  return head('MOTIFS & PAYOFFS', '반복되는 말과 사물', '계획한 복선과 원고에서 실제로 심은 복선을 구분합니다. 현재는 모두 심기 전입니다.') + `<div class="foreshadow-grid">${project.motifs.map(p => `<article class="foreshadow-card"><header><span class="state-badge warn">심기 전</span><h3>${esc(p.title)}</h3></header><dl><dt>처음</dt><dd>${esc(p.seed)}</dd><dt>반복 / 회수 계획</dt><dd>${esc(p.payoff)}</dd><dt>의미</dt><dd>${esc(p.meaning)}</dd></dl></article>`).join('')}</div>`;
}
function history() {
  return head('RESEARCH LEDGER', '고증 기록', '아래는 제공 개요를 분류한 조사 목록입니다. 외부 사료 검증 전이며, 출처가 확인된 항목만 고증 완료로 바꿉니다.') + `<div class="setting-grid">${project.research.map(p => `<article class="setting-card"><span class="state-badge ${p.kind === '창작' ? 'info' : 'warn'}">${esc(p.kind)}</span><h3>${esc(p.title)}</h3><p>${esc(p.note)}</p><dl><dt>출처 / 상태</dt><dd>${esc(p.source)}</dd><dt>확인할 것</dt><dd>${esc(p.next)}</dd></dl></article>`).join('')}</div>`;
}
function analysis() {
  return head('AUTHOR REVIEW', '원고 검토', '검토 결과는 원고를 읽고 기록합니다. 아직 점수나 통과 판정을 부여하지 않았습니다.') + `<section class="metric-grid"><article><span>MANUSCRIPTS</span><b>${project.manuscripts.length}편</b><p>현재 등록 원고</p></article><article><span>STRUCTURE</span><b>9부 + 에필로그</b><p>회차 배분 미정</p></article><article><span>RESEARCH</span><b>${project.research.filter(p => p.kind !== '창작').length}건</b><p>사료 확인 대기</p></article><article><span>REVIEW</span><b>미검토</b><p>원고 근거 필요</p></article></section><section class="bible-panel"><h2>회차마다 확인할 것</h2>${list(project.reviewChecklist)}</section>${project.manuscripts.length ? `<div class="setting-grid">${project.manuscripts.map(p => card(p.title, `${p.characters.toLocaleString()}자 · 검토 대기`)).join('')}</div>` : `<section class="bible-panel"><h2>검토할 원고가 없습니다</h2><p>개요는 스토리라인에서 확인할 수 있습니다.</p></section>`}`;
}
function render() {
  const author = project.audience === 'author';
  const entries = [['read','글 읽기'],['characters','등장인물'], ...(author ? [['storyline','스토리라인'],['settings','인물·설정'],['foreshadowing','복선'],['history','고증 기록'],['analysis','원고 검토']] : [])];
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
  main.innerHTML = ({read,characters,storyline,settings,foreshadowing,history,analysis})[view]();
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
