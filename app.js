import { STORAGE_KEY, CATEGORIES, initialState, progression, weekSummary, suggestions, ACHIEVEMENTS, petMessage, validateState } from './model.js';
import { icon, logo } from './icons.js';
import { petSvg, scenery } from './pet.js';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const category = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const formatDate = date => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
const fullDate = date => new Date(date).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
const localDateTime = date => { const d = new Date(date); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
const uid = () => crypto.randomUUID();
let storageIssue = '';
let state;
try { const saved = localStorage.getItem(STORAGE_KEY); state = saved ? validateState(JSON.parse(saved)) : initialState(); }
catch { state = initialState(); storageIssue = 'Não foi possível carregar os dados salvos. Para protegê-los, novos registros estão pausados. Importe um backup válido nas configurações ou use outro navegador.'; }
let page = location.hash.slice(1) || 'home';
let sessionMessage = '';
let modalState = {};
let toastTimer;
let lastFocus;
let welcomed = false;
const assessments = { doubts: 'Ainda tenho dúvidas', help: 'Consegui com ajuda', alone: 'Consegui sozinho' };

function notify(message, error = false) {
  const node = $('#toast'); clearTimeout(toastTimer);
  node.innerHTML = `${icon(error ? 'help' : 'check')}<span>${esc(message)}</span>`;
  node.className = `toast visible ${error ? 'error' : ''}`;
  const dialog = $('#app-dialog');
  if (dialog) {
    $('.dialog-feedback', dialog)?.remove();
    const feedback = document.createElement('div');
    feedback.className = `dialog-feedback ${error ? 'error' : ''}`;
    feedback.setAttribute('role', error ? 'alert' : 'status');
    feedback.innerHTML = `${icon(error ? 'help' : 'check')}<span>${esc(message)}</span>`;
    $('.modal-header', dialog).after(feedback);
  }
  toastTimer = setTimeout(() => node.classList.remove('visible'), 5500);
}
function commit(update, replace = false) {
  try {
    if (storageIssue && !replace) throw new Error(storageIssue);
    const saved = localStorage.getItem(STORAGE_KEY);
    const latest = !replace && saved ? validateState(JSON.parse(saved)) : state;
    const next = validateState(update(structuredClone(latest)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    state = next; storageIssue = ''; render(); return true;
  } catch (error) {
    notify(error.name === 'QuotaExceededError' ? 'O armazenamento está cheio. Exporte um backup antes de liberar espaço.' : `Não foi possível salvar. ${storageIssue || 'Verifique se o navegador permite armazenamento local e tente novamente.'}`, true);
    return false;
  }
}
function navigate(target) {
  if (location.hash === `#${target}`) { page = target; render(); }
  else location.hash = target;
}
function render() {
  const pages = ['home', 'history', 'activities', 'achievements', 'settings'];
  if (!pages.includes(page)) page = 'home';
  document.documentElement.classList.toggle('reduce-motion', state.settings.reduceMotion);
  document.title = `DevPet — ${{ home: 'Meu espaço', history: 'Histórico', activities: 'Atividades', achievements: 'Conquistas', settings: 'Configurações' }[page]}`;
  const nav = [['home', 'home', 'Meu espaço'], ['history', 'history', 'Histórico'], ['activities', 'book', 'Atividades'], ['achievements', 'trophy', 'Conquistas']];
  $('#app').innerHTML = `
    <aside class="sidebar" aria-label="Navegação principal">
      <a class="brand" href="#home" aria-label="DevPet, início">${logo}<span>DevPet<span class="brand-dot">.</span></span></a>
      <div class="sidebar-label">SEU CANTINHO</div>
      <nav>${nav.map(([id, glyph, label]) => `<a href="#${id}" class="nav-item ${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${page === id ? '<span class="nav-dot"></span>' : ''}</a>`).join('')}</nav>
      <div class="sidebar-bottom"><div class="gentle-card"><div class="little-plant">${icon('leaf')}</div><p>No seu tempo.<br><strong>Do seu jeito.</strong></p><span>Todo pequeno passo<br>faz parte da sua jornada.</span><div class="gentle-line"></div></div>
      <a class="nav-item ${page === 'settings' ? 'active' : ''}" href="#settings" ${page === 'settings' ? 'aria-current="page"' : ''}>${icon('settings')}<span>Configurações</span></a>
      <div class="local-status">${icon('shield')}<span>Seu progresso fica com você</span></div></div>
    </aside>
    <div class="workspace"><header class="topbar"><span class="topbar-title">${icon('leaf')} Seu espaço de aprendizado</span><div class="topbar-right"><span class="today">${icon('calendar')}${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span><span class="topbar-divider"></span><button class="icon-button" data-action="help" aria-label="Como o DevPet funciona">${icon('help')}</button><span class="avatar" title="Seu espaço pessoal">${icon('code')}</span></div></header>
    <main id="main" tabindex="-1">${storageIssue ? `<div class="storage-warning" role="alert">${icon('help')}<span>${esc(storageIssue)}</span><a href="#settings">Configurações</a></div>` : ''}${({ home: homePage, history: historyPage, activities: activitiesPage, achievements: achievementsPage, settings: settingsPage }[page])()}</main>
    <footer class="page-footer"><span>Feito de pequenas descobertas ${icon('leaf')}</span><span>Seu ritmo. Sua jornada.</span></footer></div>`;
}
function heading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}
function registerButton() { return `<button class="button primary" data-action="register">${icon('plus')} Registrar estudo</button>`; }
function homePage() {
  const p = progression(state.records), week = weekSummary(state.records), recommended = suggestions(state);
  const sorted = [...state.records].sort((a, b) => new Date(b.date) - new Date(a.date));
  const paused = sorted.length && Date.now() - new Date(sorted[0].date).getTime() > 3 * 86400000;
  if (paused && !welcomed) { sessionMessage = 'Que bom ter você de volta. Vamos continuar no seu ritmo?'; welcomed = true; }
  const message = sessionMessage || (p.stage === 0 ? 'Toda descoberta é um começo. Vamos dar o primeiro passo?' : 'Pronto para mais uma descoberta? Estou aqui com você.');
  const unlocked = ACHIEVEMENTS.filter(a => a.check(state.records));
  const next = ACHIEVEMENTS.find(a => !a.check(state.records));
  const completedGoal = week.sessions.length >= state.settings.weeklyGoal;
  return `${heading('UM POUQUINHO A CADA DIA', 'Seu aprendizado ganha vida<span class="heading-dot">.</span>', 'Cada descoberta faz você e seu DevPet crescerem juntos.', registerButton())}
    <div class="overview-grid"><section class="pet-card card" aria-label="Seu DevPet">
      <div class="pet-card-header"><div><div class="eyebrow">SEU COMPANHEIRO</div><div class="pet-name"><h2>${esc(state.settings.petName)}</h2><button class="icon-button small" data-action="rename" aria-label="Editar nome do pet">${icon('edit')}</button></div></div><span class="level-badge">${icon('spark')} Nível ${p.level}<span>·</span>${p.stageName}</span></div>
      <div class="pet-scene">${scenery}<div class="pet-speech">${esc(message)}<span></span></div><div class="pet-character">${petSvg(p.stage, p.accessory)}</div><span class="scene-label">${icon('heart')} Crescendo com você</span></div>
      <div class="pet-progress"><div class="progress-label"><strong>Nível ${p.level}<span> · Um passo de cada vez</span></strong><span><b>${p.current}</b> / 100 XP</span></div><div class="progress-track" role="progressbar" aria-label="Experiência para o próximo nível" aria-valuenow="${p.current}" aria-valuemin="0" aria-valuemax="100"><div style="width:${p.current}%"></div></div><div class="progress-foot"><span>${icon('spark')} ${p.remaining} XP para o nível ${p.level + 1}</span><button class="text-button" data-action="evolution">Ver evolução ${icon('arrow')}</button></div><div class="transformation-hint">${p.toTransform} XP para ${['sair do ovo', 'se tornar jovem', 'se tornar adulto', 'um novo detalhe visual'][p.stage]}.</div></div>
    </section>
    <div class="overview-side"><section class="weekly-card card"><div class="section-top"><h2>${icon('target')} Sua meta semanal</h2><button class="icon-button small" data-action="goal" aria-label="Ajustar meta semanal">${icon('edit')}</button></div><p class="card-description">Um incentivo que cabe na sua rotina.</p><div class="weekly-count"><span>${week.sessions.length}<span> / ${state.settings.weeklyGoal}</span></span><span>estudos registrados</span>${completedGoal ? `<span class="goal-done">${icon('check')} Meta alcançada</span>` : ''}</div><div class="week-days">${week.days.map(d => `<div class="week-day ${d.active ? 'done' : ''} ${d.today ? 'today' : ''}" title="${d.date}: ${d.active ? 'estudo registrado' : 'sem registros'}${d.today ? ', hoje' : ''}"><span>${d.label}</span><span class="day-dot">${d.active ? icon('check') : d.today ? '<span></span>' : '·'}</span></div>`).join('')}</div><div class="weekly-note">${icon('leaf')} ${completedGoal ? 'Meta cumprida. Descanse quando quiser!' : 'Dias de descanso também fazem parte.'}</div></section>
    <section class="stats-card card" aria-label="Resumo desta semana"><div class="stat"><span class="stat-icon green">${icon('bolt')}</span><div><strong>${week.xp}<small> XP</small></strong><span>nesta semana</span></div></div><span class="stat-divider"></span><div class="stat"><span class="stat-icon purple">${icon('clock')}</span><div><strong>${week.minutes}<small> min</small></strong><span>tempo registrado</span></div></div></section></div></div>
    <section class="quick-section"><div class="section-heading"><div><h2>O que você aprendeu hoje? <span class="tiny-spark">✧</span></h2><p>${state.records.length ? 'Seus favoritos e sugestões para continuar.' : 'Pequenas ações, novas descobertas. Escolha para registrar.'}</p></div><a class="text-button" href="#activities">Ver atividades ${icon('arrow')}</a></div><div class="quick-grid">${recommended.length ? recommended.map(a => `<button class="quick-card" data-action="register" data-id="${esc(a.id)}"><span class="quick-top"><span class="category-icon ${category(a.category).color}">${icon(category(a.category).icon)}</span><span class="xp-chip">+${a.xp} XP</span></span><strong>${esc(a.title)}</strong><span class="quick-bottom">${category(a.category).name}<span>${icon('plus')}</span></span></button>`).join('') : '<div class="empty-inline">Suas atividades estão ocultas. <a href="#activities">Gerencie suas opções</a> para voltar a registrá-las.</div>'}</div></section>
    <div class="bottom-grid"><section class="recent-card card"><div class="section-top"><h2>Seus últimos passos</h2><a class="text-button" href="#history">Ver histórico ${icon('arrow')}</a></div>${sorted.length ? `<div class="recent-list">${sorted.slice(0, 3).map(r => recordRow(r, true)).join('')}</div>` : `<div class="empty-recent"><div class="empty-illustration">${icon('book')}<span>${icon('spark')}</span></div><div><h3>Sua história começa aqui</h3><p>Registre algo que você estudou.<br>Até uma dúvida pode ser um novo passo.</p><button class="text-button" data-action="register">Registrar meu primeiro estudo ${icon('arrow')}</button></div></div>`}</section>
    <section class="achievement-teaser card"><div class="section-top"><h2>Pequenas conquistas</h2><span class="count-badge">${unlocked.length}/${ACHIEVEMENTS.length}</span></div><div class="teaser-content"><div class="achievement-medal ${next ? '' : 'unlocked'}">${icon(next?.icon || 'trophy')}<span>${icon(next ? 'lock' : 'check')}</span></div><div><span class="eyebrow">${next ? 'SUA PRÓXIMA DESCOBERTA' : 'QUE CAMINHO BONITO'}</span><h3>${esc(next?.title || 'Uma coleção de passos')}</h3><p>${esc(next?.description || 'Todas as conquistas foram desbloqueadas.')}</p></div></div><a class="text-button" href="#achievements">Conhecer as conquistas ${icon('arrow')}</a></section></div>
    <div class="kind-reminder">${icon('heart')} XP conta sua participação. Aprender é um processo, não uma pontuação.</div>`;
}
function recordRow(r, compact = false) {
  const c = category(r.category);
  return `<div class="record-row ${compact ? 'compact' : ''}"><span class="category-icon ${c.color}">${icon(c.icon)}</span><div class="record-info"><strong>${esc(r.title)}</strong><span>${formatDate(r.date)}${r.content ? ` <span class="separator">·</span> ${esc(r.content)}` : ''}${r.minutes ? ` <span class="separator">·</span> ${r.minutes} min` : ''}</span>${!compact && (r.note || r.doubt || r.assessment) ? `<div class="record-details">${r.note ? `<p>${esc(r.note)}</p>` : ''}${r.doubt ? `<p class="doubt-note">${icon('help')} ${esc(r.doubt)}</p>` : ''}${r.assessment ? `<span class="assessment-tag">${icon(r.assessment === 'alone' ? 'check' : 'leaf')} ${assessments[r.assessment]}</span>` : ''}</div>` : ''}</div><span class="record-xp">+${r.xp}<small> XP</small></span>${compact ? `<button class="icon-button small" data-action="edit-record" data-id="${esc(r.id)}" aria-label="Consultar ${esc(r.title)}">${icon('chevron')}</button>` : `<div class="record-actions"><button class="icon-button small" data-action="edit-record" data-id="${esc(r.id)}" aria-label="Editar ${esc(r.title)}">${icon('edit')}</button><button class="icon-button small danger" data-action="delete-record" data-id="${esc(r.id)}" aria-label="Excluir ${esc(r.title)}">${icon('trash')}</button></div>`}</div>`;
}
function historyPage() {
  const p = progression(state.records);
  return `${heading('CADA PASSO TEM UMA HISTÓRIA', 'Seu caminho até aqui.', 'Revisite o que aprendeu, suas tentativas e suas descobertas.', registerButton())}
    <div class="history-stats"><div class="card">${icon('book')}<strong>${state.records.length}</strong><span>estudos registrados</span></div><div class="card">${icon('bolt')}<strong>${p.total}</strong><span>XP de participação</span></div><div class="card">${icon('clock')}<strong>${state.records.reduce((s, r) => s + (r.minutes || 0), 0)}</strong><span>minutos registrados</span></div></div>
    <section class="card history-card"><div class="filter-toolbar"><label class="search-field">${icon('search')}<input type="search" id="history-search" placeholder="Buscar conteúdo, atividade ou anotação" aria-label="Buscar no histórico"></label><select id="history-category" aria-label="Filtrar histórico por categoria"><option value="all">Todas as categorias</option>${CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div><div id="history-results">${historyResults()}</div></section>`;
}
function historyResults(query = '', cat = 'all') {
  const list = state.records.filter(r => (cat === 'all' || r.category === cat) && `${r.title} ${r.content} ${r.note} ${r.doubt}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))).sort((a, b) => new Date(b.date) - new Date(a.date));
  if (!list.length) return `<div class="empty-state">${icon('history')}<h3>${state.records.length ? 'Nenhum registro encontrado' : 'Ainda há muita história para escrever'}</h3><p>${state.records.length ? 'Tente outro termo ou categoria.' : 'Seu primeiro estudo vai aparecer aqui, com todas as suas descobertas.'}</p>${!state.records.length ? registerButton() : ''}</div>`;
  return `<div class="results-label">${list.length} ${list.length === 1 ? 'registro' : 'registros'} <span>Mais recentes primeiro</span></div>${list.map(r => recordRow(r)).join('')}`;
}
function activitiesPage() {
  return `${heading('APRENDER TEM MUITOS JEITOS', 'Um passo que faz sentido para você.', 'Escolha uma atividade, adapte as sugestões ou crie a sua.', `<button class="button primary" data-action="new-activity">${icon('plus')} Criar atividade</button>`)}<div class="activities-intro">${icon('leaf')} Estudar, tentar e pedir ajuda também contam. O XP aparece antes de registrar.</div><div class="filter-toolbar activity-toolbar"><label class="search-field">${icon('search')}<input type="search" id="activity-search" placeholder="Buscar uma atividade" aria-label="Buscar atividades"></label><label class="checkbox-label"><input type="checkbox" id="show-hidden"> Mostrar ocultas</label></div><div id="activities-results">${activityResults()}</div>`;
}
function activityResults(query = '', showHidden = false) {
  const visible = state.activities.filter(a => (showHidden || !a.hidden) && a.title.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  if (!visible.length) return '<div class="empty-state card"><h3>Nenhuma atividade por aqui</h3><p>Tente outra busca, mostre as opções ocultas ou crie sua própria atividade.</p><button class="button secondary" data-action="new-activity">Criar atividade</button></div>';
  return CATEGORIES.map(c => {
    const list = visible.filter(a => a.category === c.id);
    return list.length ? `<section class="activity-group"><h2><span class="category-icon ${c.color}">${icon(c.icon)}</span>${c.full}<span class="count-badge">${list.length}</span></h2><div class="activity-list card">${list.map(a => `<div class="activity-row ${a.hidden ? 'is-hidden' : ''}"><div><strong>${esc(a.title)}</strong>${a.hidden ? '<span class="muted">Oculta nos registros rápidos</span>' : ''}</div><span class="xp-chip">+${a.xp} XP</span><button class="icon-button small" data-action="edit-activity" data-id="${esc(a.id)}" aria-label="Editar atividade: ${esc(a.title)}">${icon('edit')}</button><button class="icon-button small" data-action="toggle-activity" data-id="${esc(a.id)}" aria-label="${a.hidden ? 'Mostrar' : 'Ocultar'} atividade: ${esc(a.title)}">${icon(a.hidden ? 'eyeoff' : 'eye')}</button>${!a.hidden ? `<button class="button small-button secondary" data-action="register" data-id="${esc(a.id)}">${icon('plus')}<span>Registrar</span></button>` : ''}</div>`).join('')}</div></section>` : '';
  }).join('');
}
function achievementsPage() {
  const count = ACHIEVEMENTS.filter(a => a.check(state.records)).length;
  return `${heading('PEQUENAS VITÓRIAS, BOAS LEMBRANÇAS', 'Cada descoberta merece seu lugar.', 'Sem competição e sem prazo. Conquistas que acompanham seu caminho.', `<span class="achievement-total">${icon('trophy')} ${count} de ${ACHIEVEMENTS.length} conquistas</span>`)}<div class="achievements-grid">${ACHIEVEMENTS.map(a => { const done = a.check(state.records); return `<article class="card achievement-card ${done ? 'earned' : ''}"><div class="achievement-medal ${done ? 'unlocked' : ''}">${icon(a.icon)}<span>${icon(done ? 'check' : 'lock')}</span></div><span class="achievement-state">${done ? 'CONQUISTADA' : 'NO SEU TEMPO'}</span><h2>${esc(a.id === 'hatch' ? `Olá, pequeno ${state.settings.petName}!` : a.title)}</h2><p>${a.description}</p></article>`; }).join('')}</div><div class="kind-reminder">${icon('heart')} Conquistas acompanham os registros atuais. Dias de descanso não mudam nada.</div>`;
}
function settingsPage() {
  const s = state.settings;
  return `${heading('UM ESPAÇO COM A SUA CARA', 'Do seu jeito.', 'Ajuste seu companheiro, seus estudos e suas preferências.')}
    <div class="settings-grid"><form id="settings-form" class="card settings-card"><div class="section-top"><h2>${icon('leaf')} Seu companheiro e sua rotina</h2></div><label>Nome do pet<input name="petName" value="${esc(s.petName)}" maxlength="24" required></label><div class="form-columns"><label>Meta semanal<select name="weeklyGoal">${Array.from({ length: 21 }, (_, i) => `<option value="${i + 1}" ${s.weeklyGoal === i + 1 ? 'selected' : ''}>${i + 1} ${i === 0 ? 'estudo' : 'estudos'} por semana</option>`).join('')}</select></label><label>Momento de aprendizado<select name="experience"><option value="beginner" ${s.experience === 'beginner' ? 'selected' : ''}>Estou começando</option><option value="practicing" ${s.experience === 'practicing' ? 'selected' : ''}>Já estou praticando</option></select></label></div><label>O que você quer estudar?<input name="topics" value="${esc(s.topics.join(', '))}" maxlength="300" placeholder="Lógica, Python, HTML, funções..."><small>Separe os assuntos por vírgulas. Eles ajudam a sugerir atividades.</small></label><label class="motion-option"><span><strong>Reduzir animações</strong><small>Deixe os movimentos do pet e as transições mais discretos.</small></span><input type="checkbox" class="switch" name="reduceMotion" ${s.reduceMotion ? 'checked' : ''}></label><p class="form-note">Seu nível de experiência só muda as sugestões. Todas as atividades continuam disponíveis.</p><button class="button primary" type="submit">${icon('check')} Salvar preferências</button></form>
    <div class="settings-side"><section class="card settings-card backup-card"><span class="category-icon green">${icon('shield')}</span><h2>Seu progresso fica com você</h2><p>Esta versão salva os dados <strong>somente neste navegador e dispositivo</strong>, sem conta e sem sincronização.</p><p>Limpar os dados do navegador pode apagar seus registros. Exporte um backup para guardá-los ou transferi-los.</p><button class="button secondary" data-action="export">${icon('download')} Exportar backup</button><button class="button plain" data-action="import">${icon('upload')} Importar backup</button><input type="file" id="backup-file" accept="application/json,.json" hidden><div class="backup-details">O backup inclui estudos, atividades e preferências.</div></section><section class="card settings-card gentle-settings"><h3>${icon('heart')} Constância sem cobrança</h3><p>Seu pet não perde níveis por pausas. Metas semanais são convites: você pode ajustá-las sempre que precisar.</p></section></div></div>`;
}

window.addEventListener('hashchange', () => { page = location.hash.slice(1); render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  try { state = event.newValue ? validateState(JSON.parse(event.newValue)) : initialState(); storageIssue = ''; closeModal(); render(); notify('Progresso atualizado a partir de outra aba.'); }
  catch { notify('Os dados de outra aba não puderam ser lidos. Recarregue para verificar.', true); }
});

function openModal(title, subtitle, body, wide = false) {
  if (!$('#app-dialog')) lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<dialog id="app-dialog" class="modal ${wide ? 'wide-modal' : ''}" aria-labelledby="dialog-title" aria-describedby="dialog-subtitle"><div class="modal-header"><div><h2 id="dialog-title">${title}</h2><p id="dialog-subtitle">${subtitle}</p></div><button class="icon-button" data-action="close-modal" aria-label="Fechar janela">${icon('close')}</button></div>${body}</dialog>`;
  const dialog = $('#app-dialog'); dialog.showModal(); document.body.classList.add('modal-open');
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
}
function closeModal() {
  $('#app-dialog')?.close(); $('#modal-root').innerHTML = ''; document.body.classList.remove('modal-open');
  if (lastFocus?.isConnected) lastFocus.focus(); else $('#main')?.focus({ preventScroll: true });
}
function openRegister(activityId = '', record = null) {
  const available = state.activities.filter(a => !a.hidden || a.id === record?.activityId);
  if (!available.length) { navigate('activities'); notify('Crie uma atividade ou mostre uma opção oculta para registrar.'); return; }
  modalState = { type: 'register', selected: activityId || record?.activityId || '', record, busy: false, category: 'all', query: '', xp: record?.xp ?? null };
  const selected = available.find(a => a.id === modalState.selected);
  const topics = state.settings.topics;
  openModal(record ? 'Seu passo, com mais detalhes' : 'O que você estudou?', record ? 'Edite o registro. Seu XP e a evolução do pet serão recalculados.' : 'Uma tentativa, uma descoberta, uma dúvida. Tudo faz parte.', `
    <form id="record-form"><div class="modal-body"><label class="search-field">${icon('search')}<input id="register-search" type="search" placeholder="Encontre uma atividade" aria-label="Buscar atividade para registrar"></label><div class="category-tabs" role="group" aria-label="Categorias de estudo"><button type="button" class="category-tab active" data-action="register-category" data-id="all">Todas</button>${CATEGORIES.map(c => `<button type="button" class="category-tab" data-action="register-category" data-id="${c.id}">${c.name}</button>`).join('')}</div><div id="register-options" class="register-options">${registerOptions()}</div>
    <div class="self-assessment"><span class="field-title">Como foi para você? <span>Opcional</span><button type="button" class="clear-assessment" data-action="clear-assessment">Limpar</button></span><div class="assessment-options">${Object.entries(assessments).map(([key, label]) => `<label><input type="radio" name="assessment" value="${key}" ${record?.assessment === key ? 'checked' : ''}><span>${icon(key === 'alone' ? 'check' : key === 'help' ? 'heart' : 'help')}${label}</span></label>`).join('')}</div></div>
    <details class="optional-details" ${record ? 'open' : ''}><summary>${icon('plus')} Acrescentar detalhes <span>opcional</span>${icon('down')}</summary><div class="details-content"><div class="form-columns"><label>Conteúdo ou linguagem<input name="content" maxlength="100" placeholder="Ex.: condicionais em Python" value="${esc(record?.content || '')}" list="study-topics"><datalist id="study-topics">${topics.map(t => `<option value="${esc(t)}"></option>`).join('')}</datalist></label><label>Tempo dedicado (minutos)<input name="minutes" type="number" min="1" max="1440" step="1" placeholder="Ex.: 25" value="${record?.minutes || ''}"></label></div><label>O que você aprendeu?<textarea name="note" maxlength="500" rows="2" placeholder="Uma descoberta que quero lembrar...">${esc(record?.note || '')}</textarea></label><label>Ficou alguma dúvida?<textarea name="doubt" maxlength="500" rows="2" placeholder="Algo para explorar no próximo estudo...">${esc(record?.doubt || '')}</textarea></label><div class="form-columns"><label>Quando você estudou?<input type="datetime-local" name="date" required max="${localDateTime(new Date())}" value="${localDateTime(record?.date || new Date())}"></label>${record ? `<label>XP deste registro<select name="xp" id="record-xp-select">${[5, 10, 15, 20].map(x => `<option value="${x}" ${record.xp === x ? 'selected' : ''}>${x} XP</option>`).join('')}</select></label>` : ''}</div></div></details></div>
    <div class="modal-footer"><span id="selected-xp" class="selected-xp">${selected ? `${icon('bolt')} +${record?.xp ?? selected.xp} XP <small>de participação</small>` : 'Escolha uma atividade para começar'}</span><button type="submit" class="button primary" id="save-record" ${selected ? '' : 'disabled'}>${icon(record ? 'check' : 'plus')} ${record ? 'Salvar alterações' : 'Registrar estudo'}</button></div></form>`, true);
  if (selected) setTimeout(() => $('.activity-option.selected')?.scrollIntoView({ block: 'nearest' }), 30);
}
function registerOptions() {
  const list = state.activities.filter(a => (!a.hidden || a.id === modalState.record?.activityId) && (modalState.category === 'all' || a.category === modalState.category) && a.title.toLocaleLowerCase('pt-BR').includes(modalState.query.toLocaleLowerCase('pt-BR')));
  return list.length ? list.map(a => `<button type="button" class="activity-option ${modalState.selected === a.id ? 'selected' : ''}" data-action="choose-activity" data-id="${esc(a.id)}" aria-pressed="${modalState.selected === a.id}"><span class="category-icon ${category(a.category).color}">${icon(category(a.category).icon)}</span><span>${esc(a.title)}</span><span class="xp-chip">+${a.xp} XP</span><span class="selection-circle">${modalState.selected === a.id ? icon('check') : ''}</span></button>`).join('') : '<div class="empty-inline">Nenhuma atividade encontrada. Tente outro termo.</div>';
}
function updateSelected() {
  $('#register-options').innerHTML = registerOptions();
  const activity = state.activities.find(a => a.id === modalState.selected);
  $('#selected-xp').innerHTML = activity ? `${icon('bolt')} +${modalState.xp ?? activity.xp} XP <small>de participação</small>` : 'Escolha uma atividade para começar';
  $('#save-record').disabled = !activity;
}
function editActivity(id = '') {
  const a = state.activities.find(x => x.id === id);
  modalState = { type: 'activity', id, busy: false };
  openModal(a ? 'Uma atividade com a sua cara' : 'Crie seu próximo passo', 'Escolha uma descrição simples e a pontuação da atividade.', `<form id="activity-form"><div class="modal-body form-stack"><label>Nome da atividade<input name="title" required maxlength="140" placeholder="Ex.: pratiquei um comando novo" value="${esc(a?.title || '')}"></label><label>Categoria<select name="category">${CATEGORIES.map(c => `<option value="${c.id}" ${a?.category === c.id ? 'selected' : ''}>${c.full}</option>`).join('')}</select></label><label>Experiência por registro<select name="xp">${[[5, 'Atividade leve'], [10, 'Estudo, revisão ou investigação'], [15, 'Prática ou compreensão'], [20, 'Etapa significativa de projeto']].map(([xp, text]) => `<option value="${xp}" ${(a?.xp || 10) === xp ? 'selected' : ''}>${xp} XP · ${text}</option>`).join('')}</select></label><label>Assuntos relacionados <span class="optional-label">opcional</span><input name="tags" maxlength="300" placeholder="Ex.: lógica, funções, projetos" value="${esc(a?.tags.join(', ') || '')}"><small>Separe por vírgulas para ajudar nas sugestões.</small></label><p class="form-note">Mudanças nesta opção valem para novos estudos. Para corrigir o XP de um estudo já registrado, edite-o no histórico.</p></div><div class="modal-footer"><button type="button" class="button plain" data-action="close-modal">Cancelar</button><button type="submit" class="button primary">${icon('check')} ${a ? 'Salvar atividade' : 'Criar atividade'}</button></div></form>`);
}
function openGoal() {
  openModal('Uma meta que cabe na sua semana', 'Você pode mudar de ideia a qualquer momento.', `<form id="goal-form"><div class="modal-body form-stack"><label>Quantos estudos você gostaria de registrar por semana?<input type="number" name="goal" min="1" max="21" step="1" value="${state.settings.weeklyGoal}" required></label><p class="gentle-message">${icon('leaf')} São sessões de estudo, não dias seguidos. A semana começa na segunda-feira. Descansar não apaga suas conquistas.</p></div><div class="modal-footer"><button class="button plain" type="button" data-action="close-modal">Cancelar</button><button type="submit" class="button primary">Salvar meta</button></div></form>`);
}
function openEvolution() {
  const p = progression(state.records);
  openModal('Uma jornada para crescer juntos', `Você já registrou ${p.total} XP de participação. Cada 100 XP leva a um novo nível.`, `<div class="modal-body"><div class="evolution-stages">${['Ovo', 'Filhote', 'Jovem', 'Adulto'].map((name, i) => `<div class="evolution-stage ${p.stage === i ? 'current' : ''} ${p.stage < i ? 'locked' : ''}">${petSvg(i, 0, true)}<strong>${name}</strong><span>Nível ${[1, 2, 5, 10][i]}</span><small>${[0, 100, 400, 900][i]} XP${p.stage === i ? ' · Você está aqui' : ''}</small></div>`).join('')}</div><div class="evolution-next">${icon('spark')}<div><strong>${p.toTransform} XP para ${p.stage < 3 ? 'a próxima transformação' : 'o próximo detalhe visual'}</strong><p>${p.stage < 3 ? 'Seu companheiro muda de aparência conforme você registra estudos.' : 'Depois de adulto: broche, óculos, uma luz companheira e brilhos. Depois, a luz ganha novas cores a cada 500 XP.'}</p></div></div><p class="form-note">O XP representa o que você registrou, não comprova domínio de programação. Nenhum nível é perdido por dias de descanso. Corrigir ou excluir registros recalcula a evolução.</p></div><div class="modal-footer"><button class="button primary" data-action="close-modal">Vamos no meu ritmo ${icon('leaf')}</button></div>`, true);
}
function openHelp() {
  openModal('Olá! Este é o seu DevPet.', 'Um companheiro para acompanhar suas pequenas descobertas.', `<div class="modal-body help-content"><div><span>01</span><div><h3>Estudou, tentou ou descobriu algo?</h3><p>Escolha uma atividade e registre. Detalhes e autoavaliação são opcionais. Você não precisa conectar contas ou comprovar nada.</p></div></div><div><span>02</span><div><h3>Veja seu companheiro crescer</h3><p>Atividades valem 5, 10, 15 ou 20 XP. Cada 100 XP aumenta um nível. Ovo, filhote, jovem e adulto: cada fase tem seu tempo.</p></div></div><div><span>03</span><div><h3>Faça no seu ritmo</h3><p>Seu pet não morre, adoece ou perde níveis por pausas. XP representa participação, não domínio. Não há ranking nem comparação.</p></div></div><p class="gentle-message">${icon('shield')} Tudo fica salvo neste navegador. Em Configurações, você pode exportar e importar seu backup.</p></div><div class="modal-footer"><button class="button primary" data-action="close-modal">Entendi, vamos juntos ${icon('arrow')}</button></div>`);
}
function deleteRecord(id) {
  const record = state.records.find(r => r.id === id); if (!record) return;
  modalState = { type: 'delete', id };
  openModal('Excluir este registro?', 'Você pode corrigir o registro no histórico se preferir.', `<div class="modal-body"><div class="delete-preview"><span class="category-icon ${category(record.category).color}">${icon(category(record.category).icon)}</span><div><strong>${esc(record.title)}</strong><p>${fullDate(record.date)} · ${record.xp} XP</p></div></div><p class="form-note">Os ${record.xp} XP deste registro serão removidos. Nível, aparência do pet, meta e conquistas serão recalculados.</p></div><div class="modal-footer"><button class="button plain" data-action="close-modal">Manter registro</button><button class="button danger-button" data-action="confirm-delete">${icon('trash')} Excluir registro</button></div>`);
}
function exportBackup() {
  try {
    const data = storageIssue ? localStorage.getItem(STORAGE_KEY) : JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data || JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `devpet-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Backup exportado. Guarde esse arquivo com carinho.');
  } catch { notify('Não foi possível exportar o backup neste navegador.', true); }
}
async function prepareImport(file) {
  if (!file) return;
  try {
    if (file.size > 30 * 1024 * 1024) throw new Error('O arquivo é grande demais. Escolha um backup DevPet de até 30 MB.');
    const imported = validateState(JSON.parse(await file.text()));
    modalState = { type: 'import', imported };
    const p = progression(imported.records);
    openModal('Seu progresso está pronto para voltar', 'Confira o backup antes de restaurar.', `<div class="modal-body"><div class="import-preview">${petSvg(p.stage, p.accessory, true)}<div><h3>${esc(imported.settings.petName)}</h3><p>${imported.records.length} estudos · ${p.total} XP · Nível ${p.level}</p><p>${imported.activities.length} atividades e suas preferências</p></div></div><p class="gentle-message">${icon('help')} A importação substitui os ${state.records.length} registros atuais neste navegador. Exporte seu progresso atual antes, se quiser guardá-lo.</p><button class="text-button" data-action="export">${icon('download')} Exportar dados atuais</button></div><div class="modal-footer"><button class="button plain" data-action="close-modal">Cancelar</button><button class="button primary" data-action="confirm-import">${icon('upload')} Restaurar backup</button></div>`);
  } catch (error) { notify(error instanceof SyntaxError ? 'Não foi possível ler este arquivo JSON. Seus dados atuais foram preservados.' : error.message, true); }
}

document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); $('#main')?.focus(); return; }
  const button = event.target.closest('[data-action]'); if (!button) return;
  const id = button.dataset.id;
  switch (button.dataset.action) {
    case 'register': openRegister(id); break;
    case 'close-modal': closeModal(); break;
    case 'help': openHelp(); break;
    case 'evolution': openEvolution(); break;
    case 'goal': openGoal(); break;
    case 'rename': openModal('Como seu companheiro se chama?', 'Um nome para quem vai crescer com você.', `<form id="rename-form"><div class="modal-body"><label>Nome do pet<input name="petName" maxlength="24" required value="${esc(state.settings.petName)}" autofocus></label></div><div class="modal-footer"><button type="button" class="button plain" data-action="close-modal">Cancelar</button><button type="submit" class="button primary">Salvar nome</button></div></form>`); break;
    case 'new-activity': editActivity(); break;
    case 'edit-activity': editActivity(id); break;
    case 'toggle-activity': {
      const hiddenChecked = $('#show-hidden')?.checked, query = $('#activity-search')?.value || '';
      if (commit(s => { const a = s.activities.find(a => a.id === id); if (a) a.hidden = !a.hidden; return s; })) {
        if ($('#show-hidden')) { $('#show-hidden').checked = hiddenChecked; $('#activity-search').value = query; $('#activities-results').innerHTML = activityResults(query, hiddenChecked); }
        notify(state.activities.find(a => a.id === id)?.hidden ? 'Atividade oculta. Você pode mostrá-la novamente quando quiser.' : 'Atividade disponível para registrar.');
      } break;
    }
    case 'edit-record': { const record = state.records.find(r => r.id === id); if (record) openRegister(record.activityId, record); break; }
    case 'delete-record': deleteRecord(id); break;
    case 'confirm-delete': if (commit(s => { s.records = s.records.filter(r => r.id !== modalState.id); return s; })) { closeModal(); notify('Registro excluído. O progresso foi recalculado.'); } break;
    case 'choose-activity': modalState.selected = id; modalState.xp = null; updateSelected(); if ($('#record-xp-select')) $('#record-xp-select').value = state.activities.find(a => a.id === id).xp; break;
    case 'clear-assessment': document.querySelectorAll('[name="assessment"]').forEach(input => input.checked = false); break;
    case 'register-category': modalState.category = id; document.querySelectorAll('.category-tab').forEach(t => t.classList.toggle('active', t.dataset.id === id)); $('#register-options').innerHTML = registerOptions(); break;
    case 'export': exportBackup(); break;
    case 'import': $('#backup-file').click(); break;
    case 'confirm-import': if (commit(() => modalState.imported, true)) { sessionMessage = 'Que bom ter você por aqui. Seu progresso voltou!'; closeModal(); render(); notify('Backup restaurado. Tudo pronto para continuar.'); } break;
  }
});
document.addEventListener('input', event => {
  const { id, value } = event.target;
  if (id === 'register-search') { modalState.query = value; $('#register-options').innerHTML = registerOptions(); }
  if (id === 'history-search') $('#history-results').innerHTML = historyResults(value, $('#history-category').value);
  if (id === 'activity-search') $('#activities-results').innerHTML = activityResults(value, $('#show-hidden').checked);
});
document.addEventListener('change', event => {
  const { id, value } = event.target;
  if (id === 'history-category') $('#history-results').innerHTML = historyResults($('#history-search').value, value);
  if (id === 'show-hidden') $('#activities-results').innerHTML = activityResults($('#activity-search').value, event.target.checked);
  if (id === 'backup-file') { prepareImport(event.target.files[0]); event.target.value = ''; }
  if (id === 'record-xp-select') { modalState.xp = Number(value); updateSelected(); }
});
function splitTopics(value) { return [...new Set(value.split(',').map(t => t.trim()).filter(Boolean))]; }
document.addEventListener('submit', event => {
  const form = event.target; if (!['record-form', 'activity-form', 'settings-form', 'rename-form', 'goal-form'].includes(form.id)) return;
  event.preventDefault(); const data = new FormData(form);
  if (form.id === 'record-form') {
    if (modalState.busy) return;
    const a = state.activities.find(a => a.id === modalState.selected); if (!a) return;
    const date = new Date(data.get('date'));
    if (!Number.isFinite(date.getTime()) || date > new Date()) { notify('Escolha uma data válida, até o momento atual.', true); return; }
    const original = modalState.record, before = progression(state.records);
    const unchanged = original && original.activityId === a.id;
    const record = { id: original?.id || uid(), activityId: a.id, title: unchanged ? original.title : a.title, category: unchanged ? original.category : a.category, xp: modalState.xp ?? a.xp, date: date.toISOString(), content: data.get('content').trim(), minutes: data.get('minutes') ? Number(data.get('minutes')) : null, note: data.get('note').trim(), doubt: data.get('doubt').trim(), assessment: data.get('assessment') || '' };
    modalState.busy = true; $('#save-record').disabled = true;
    if (commit(s => {
      if (original) { if (!s.records.some(r => r.id === original.id)) throw new Error('Registro removido em outra aba.'); s.records = s.records.map(r => r.id === original.id ? record : r); }
      else if (!s.records.some(r => r.id === record.id)) s.records.push(record);
      return s;
    })) {
      const after = progression(state.records); sessionMessage = original ? 'Cada detalhe ajuda a contar sua jornada.' : petMessage(a.category);
      closeModal(); render();
      notify(original ? 'Registro atualizado. Seu progresso foi recalculado.' : after.stage > before.stage ? `+${record.xp} XP! ${state.settings.petName} cresceu: agora é ${after.stageName.toLowerCase()}.` : after.level > before.level ? `+${record.xp} XP! Vocês chegaram ao nível ${after.level}.` : `Estudo registrado. +${record.xp} XP para a sua jornada!`);
    } else { modalState.busy = false; $('#save-record').disabled = false; }
  }
  if (form.id === 'activity-form') {
    if (modalState.busy) return;
    const title = data.get('title').trim(), tags = splitTopics(data.get('tags'));
    if (!title || tags.length > 20 || tags.some(t => t.length > 60)) { notify('Preencha um nome e use até 20 assuntos de até 60 caracteres.', true); return; }
    modalState.busy = true;
    if (commit(s => { const a = s.activities.find(a => a.id === modalState.id); const changes = { title, category: data.get('category'), xp: Number(data.get('xp')), tags }; if (a) Object.assign(a, changes); else s.activities.push({ ...changes, id: uid(), hidden: false }); return s; })) { closeModal(); notify('Atividade salva. Seu próximo passo está pronto.'); } else modalState.busy = false;
  }
  if (form.id === 'settings-form') {
    const petName = data.get('petName').trim(), topics = splitTopics(data.get('topics'));
    if (!petName || topics.length > 20 || topics.some(t => t.length > 60)) { notify('Preencha o nome e use até 20 assuntos de até 60 caracteres.', true); return; }
    if (commit(s => { s.settings = { ...s.settings, petName, topics, weeklyGoal: Number(data.get('weeklyGoal')), experience: data.get('experience'), reduceMotion: data.get('reduceMotion') === 'on' }; return s; })) notify('Preferências salvas. Esse espaço é seu.');
  }
  if (form.id === 'rename-form') {
    const name = data.get('petName').trim(); if (!name) { notify('Escolha um nome para seu companheiro.', true); return; }
    if (commit(s => { s.settings.petName = name; return s; })) { closeModal(); notify(`Agora seu companheiro se chama ${name}.`); }
  }
  if (form.id === 'goal-form') {
    if (commit(s => { s.settings.weeklyGoal = Number(data.get('goal')); return s; })) { closeModal(); notify('Meta ajustada ao seu ritmo.'); }
  }
});

render();
