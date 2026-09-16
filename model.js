export const STORAGE_KEY = 'devpet.v1';
export const CATEGORIES = [
  { id: 'learn', name: 'Aprendizado', full: 'Aprendizado e compreensão', icon: 'book', color: 'blue' },
  { id: 'practice', name: 'Prática', full: 'Prática de programação', icon: 'code', color: 'purple' },
  { id: 'debug', name: 'Erros e descobertas', full: 'Erros e dificuldades', icon: 'bug', color: 'orange' },
  { id: 'project', name: 'Projetos', full: 'Pequenos projetos', icon: 'project', color: 'green' },
  { id: 'review', name: 'Revisão', full: 'Revisão e consolidação', icon: 'refresh', color: 'pink' },
];
const definitions = [
  ['concept', 'learn', 'Estudei um conceito novo', 10, ['lógica', 'conceitos']],
  ['lesson', 'learn', 'Assisti a uma aula e fiz anotações', 10, []],
  ['read', 'learn', 'Li um material de estudo ou uma explicação', 10, []],
  ['explain', 'learn', 'Expliquei um conceito com minhas próprias palavras', 15, ['conceitos']],
  ['logic', 'practice', 'Resolvi um exercício de lógica', 15, ['lógica']],
  ['variables', 'practice', 'Pratiquei variáveis e operadores', 15, ['variáveis', 'lógica']],
  ['conditions', 'practice', 'Pratiquei estruturas condicionais', 15, ['condicionais', 'lógica']],
  ['loops', 'practice', 'Pratiquei laços de repetição', 15, ['laços', 'lógica']],
  ['functions', 'practice', 'Pratiquei funções', 15, ['funções']],
  ['arrays', 'practice', 'Pratiquei listas, arrays ou strings', 15, ['listas', 'arrays', 'strings']],
  ['redo', 'practice', 'Refiz um exercício sem consultar a resposta', 15, []],
  ['investigate', 'debug', 'Investiguei um erro no meu código', 10, ['erros']],
  ['fix', 'debug', 'Corrigi um erro e entendi o motivo', 15, ['erros']],
  ['solutions', 'debug', 'Testei diferentes soluções para um problema', 15, ['lógica', 'erros']],
  ['help', 'debug', 'Pedi ajuda e compreendi a explicação', 10, []],
  ['start', 'project', 'Comecei um projeto de estudo', 10, ['projetos']],
  ['step', 'project', 'Avancei uma etapa do meu projeto', 20, ['projetos']],
  ['feature', 'project', 'Adicionei uma funcionalidade simples', 20, ['projetos']],
  ['finish', 'project', 'Concluí um pequeno projeto', 20, ['projetos']],
  ['review', 'review', 'Revisei um conteúdo anterior', 10, []],
  ['retry', 'review', 'Refiz um exercício que havia errado', 15, ['lógica']],
  ['notes', 'review', 'Organizei minhas anotações', 5, []],
  ['question', 'review', 'Registrei uma dúvida para estudar depois', 5, []],
];
export function initialState() {
  return {
    version: 1,
    settings: { petName: 'Byte', weeklyGoal: 3, experience: 'beginner', topics: ['Lógica de programação'], reduceMotion: false },
    activities: definitions.map(([id, category, title, xp, tags]) => ({ id, category, title, xp, tags, hidden: false })),
    records: [],
  };
}
export function progression(records) {
  const total = records.reduce((sum, record) => sum + record.xp, 0);
  const level = Math.floor(total / 100) + 1;
  const stage = total < 100 ? 0 : total < 400 ? 1 : total < 900 ? 2 : 3;
  const nextThreshold = [100, 400, 900][stage] ?? (Math.floor((total - 900) / 500) + 1) * 500 + 900;
  return { total, level, stage, stageName: ['Ovo', 'Filhote', 'Jovem', 'Adulto'][stage], current: total % 100, remaining: 100 - total % 100, nextThreshold, toTransform: nextThreshold - total, accessory: Math.max(0, Math.floor((total - 900) / 500)) };
}
export function localDay(input) {
  const date = new Date(input);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function weekSummary(records, now = new Date()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  const end = new Date(start); end.setDate(end.getDate() + 7);
  const sessions = records.filter(r => new Date(r.date) >= start && new Date(r.date) < end);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start); day.setDate(start.getDate() + i);
    return { date: localDay(day), label: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i], active: sessions.some(r => localDay(r.date) === localDay(day)), today: localDay(day) === localDay(now), future: localDay(day) > localDay(now) };
  });
  return { sessions, days, xp: sessions.reduce((s, r) => s + r.xp, 0), minutes: sessions.reduce((s, r) => s + (r.minutes || 0), 0) };
}
export const ACHIEVEMENTS = [
  { id: 'first', title: 'O primeiro passo', description: 'Registre sua primeira atividade de estudo.', icon: 'leaf', check: r => r.length > 0 },
  { id: 'exercise', title: 'Uma ideia na prática', description: 'Primeiro exercício registrado.', icon: 'code', check: r => r.some(x => x.category === 'practice') },
  { id: 'error', title: 'Erro que ensina', description: 'Primeiro erro compreendido.', icon: 'bug', check: r => r.some(x => x.activityId === 'fix') },
  { id: 'project', title: 'Do começo ao fim', description: 'Primeiro projeto concluído.', icon: 'project', check: r => r.some(x => x.activityId === 'finish') },
  { id: 'hatch', title: 'Do ovo para o mundo', description: 'Acumule 100 XP e veja seu pet sair do ovo.', icon: 'spark', check: r => progression(r).total >= 100 },
  { id: 'curious', title: 'Curiosidade sem limites', description: 'Experimente as cinco categorias de estudo.', icon: 'book', check: r => new Set(r.map(x => x.category)).size === 5 },
  { id: 'return', title: 'Um passo de cada vez', description: 'Registre estudos em três dias diferentes, sem precisar ser consecutivos.', icon: 'sun', check: r => new Set(r.map(x => localDay(x.date))).size >= 3 },
  { id: 'adult', title: 'Crescemos juntos', description: 'Acumule 900 XP e conheça seu pet adulto.', icon: 'heart', check: r => progression(r).total >= 900 },
];
export function suggestions(state) {
  const counts = new Map(); state.records.forEach(r => counts.set(r.activityId, (counts.get(r.activityId) || 0) + 1));
  const topics = state.settings.topics.join(' ').toLocaleLowerCase('pt-BR');
  const beginner = ['concept', 'logic', 'investigate', 'notes'];
  const practicing = ['functions', 'solutions', 'step', 'review'];
  const favorites = state.settings.experience === 'beginner' ? beginner : practicing;
  const score = a => (counts.get(a.id) || 0) * 10 + (a.tags.some(tag => topics.includes(tag)) ? 3 : 0) + (favorites.includes(a.id) ? 5 : 0);
  return state.activities.filter(a => !a.hidden).sort((a, b) => score(b) - score(a)).slice(0, 4);
}
export function petMessage(category) {
  return { learn: 'Mais uma descoberta para guardar. Vamos no seu ritmo!', practice: 'Uma tentativa de cada vez. Obrigado por praticar comigo!', debug: 'Entender uma dificuldade também faz parte do caminho.', project: 'Uma pequena ideia está ganhando forma!', review: 'Revisitar também é avançar. Estou por aqui!' }[category] || 'Cada pequeno passo conta. Vamos juntos!';
}
const isText = (v, max, allowEmpty = true) => typeof v === 'string' && v.length <= max && (allowEmpty || v.trim().length > 0);
const validXP = x => [5, 10, 15, 20].includes(x);
export function validateState(data) {
  const fail = () => { throw new Error('Este arquivo não é um backup válido do DevPet. Seus dados atuais foram preservados.'); };
  if (!data || data.version !== 1 || !data.settings || !Array.isArray(data.activities) || !Array.isArray(data.records)) fail();
  const s = data.settings;
  if (!isText(s.petName, 24, false) || !Number.isInteger(s.weeklyGoal) || s.weeklyGoal < 1 || s.weeklyGoal > 21 || !['beginner', 'practicing'].includes(s.experience) || typeof s.reduceMotion !== 'boolean' || !Array.isArray(s.topics) || s.topics.length > 20 || !s.topics.every(t => isText(t, 60, false))) fail();
  if (data.activities.length > 500 || data.records.length > 50000) fail();
  const cats = CATEGORIES.map(c => c.id);
  for (const a of data.activities) {
    if (!a || !isText(a.id, 100, false) || !isText(a.title, 140, false) || !cats.includes(a.category) || !validXP(a.xp) || typeof a.hidden !== 'boolean' || !Array.isArray(a.tags) || a.tags.length > 20 || !a.tags.every(t => isText(t, 60))) fail();
  }
  const ids = new Set(data.activities.map(a => a.id));
  if (ids.size !== data.activities.length) fail();
  for (const r of data.records) {
    if (!r || !isText(r.id, 100, false) || !ids.has(r.activityId) || !isText(r.title, 140, false) || !cats.includes(r.category) || !validXP(r.xp) || !isText(r.date, 40, false) || !Number.isFinite(Date.parse(r.date)) || Date.parse(r.date) > Date.now() + 60000 || !isText(r.content, 100) || !isText(r.note, 500) || !isText(r.doubt, 500) || !['', 'doubts', 'help', 'alone'].includes(r.assessment) || !(r.minutes === null || (Number.isInteger(r.minutes) && r.minutes >= 1 && r.minutes <= 1440))) fail();
  }
  if (new Set(data.records.map(r => r.id)).size !== data.records.length) fail();
  return {
    version: 1,
    settings: { petName: s.petName.trim(), weeklyGoal: s.weeklyGoal, experience: s.experience, topics: [...s.topics], reduceMotion: s.reduceMotion },
    activities: data.activities.map(a => ({ id: a.id, title: a.title, category: a.category, xp: a.xp, hidden: a.hidden, tags: [...a.tags] })),
    records: data.records.map(r => ({ id: r.id, activityId: r.activityId, title: r.title, category: r.category, xp: r.xp, date: r.date, content: r.content, note: r.note, doubt: r.doubt, assessment: r.assessment, minutes: r.minutes })),
  };
}
