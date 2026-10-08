(function () {
  'use strict';
  const E = window.CommanderEngine, D = window.MTG_DATA;
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let state = E.create(), undo = [], searchLimit = 50, quizAnswers = {};
  try { quizAnswers = JSON.parse(localStorage.getItem('commander-quiz-20260925') || '{}'); } catch (_) {}
  if (!quizAnswers || typeof quizAnswers !== 'object' || Array.isArray(quizAnswers)) quizAnswers = {};
  function switchTab(tab) {
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    document.querySelectorAll('.tab-panel').forEach(p => p.hidden = p.id !== tab);
  }
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  function setMessage(text, error, rule) {
    $('message').className = 'message' + (error ? ' error' : '');
    $('message').textContent = text + (rule ? ' [CR ' + rule + ']' : '');
  }
  function renderLab() {
    const step = E.steps[state.step];
    $('players').innerHTML = state.players.map((name, i) => '<div class="player' + (i === state.active ? ' active' : '') + (i === state.priority ? ' priority' : '') + '"><strong>' + esc(name) + '</strong><small>' + (i === state.active ? 'Jogador ativo · ' : '') + 'Turno pessoal ' + state.ownTurns[i] + '</small><small>Terreno: ' + state.landPlayed[i] + '/1 · Lealdade: ' + (state.loyaltyUsed[i] ? 'usada' : 'livre') + '</small><p class="priority-tag">' + (i === state.priority ? 'TEM PRIORIDADE' : '&nbsp;') + '</p></div>').join('');
    $('turn-label').textContent = 'TURNO ' + state.turn + ' · ATIVO: ' + state.players[state.active] + ' · FASE: ' + step.phase.toUpperCase();
    $('step-label').textContent = step.name;
    $('step-note').textContent = step.note;
    $('step-rule').textContent = 'CR ' + step.rule + ' · Prioridade agora: ' + state.players[state.priority];
    $('timeline').innerHTML = '<span>Desvirar · sem prioridade</span>' + Object.entries(E.steps).map(([id, info]) => '<span class="' + (id === state.step ? 'current' : (!state.options.firstStrike && id === 'firstDamage') || (!state.options.hasAttackers && ['blockers', 'firstDamage', 'damage'].includes(id)) ? 'skipped' : '') + '">' + esc(id === 'cleanup' && !state.options.cleanupTrigger ? 'Limpeza · sem prioridade' : info.name) + '</span>').join('');
    $('actor').innerHTML = state.players.map((name, i) => '<option value="' + i + '"' + (i === state.priority ? ' selected' : '') + '>' + esc(name) + '</option>').join('');
    const targets = state.stack.filter(x => x.kind === 'spell').slice().reverse();
    $('counter-target').innerHTML = targets.length ? targets.map(x => '<option value="' + x.id + '">#' + x.id + ' · ' + esc(x.label) + '</option>').join('') : '<option value="">Nenhuma mágica na pilha</option>';
    $('stack-count').textContent = '(' + state.stack.length + ')';
    $('stack').innerHTML = state.stack.length ? state.stack.slice().reverse().map((x, i) => '<div class="stack-item' + (i === 0 ? ' top-item' : '') + '">' + (i === 0 ? '<span class="top-label">TOPO · PRÓXIMO A RESOLVER</span>' : '') + '<strong>#' + x.id + ' · ' + esc(x.label) + '</strong><p>' + esc(state.players[x.controller]) + ' · ' + (x.kind === 'spell' ? 'Mágica' : 'Habilidade') + (x.targetId ? ' · alvo #' + x.targetId : '') + '</p></div>').join('') : '<div class="empty-stack">Pilha vazia.<br>Se todos passarem consecutivamente, a etapa termina.</div>';
    $('passes-label').textContent = state.passes + ' de ' + state.players.length + ' passes consecutivos desde a última ação. Próximo a agir: ' + state.players[state.priority] + '.';
    $('pass').textContent = state.players[state.priority] + ': passar prioridade';
    $('undo').disabled = undo.length === 0;
    $('history').innerHTML = state.log.slice().reverse().map(item => '<li>' + esc(item.text) + '<small>Turno ' + item.turn + (item.rule ? ' · CR ' + esc(item.rule) : '') + '</small></li>').join('');
    renderActions();
  }
  function renderActions() {
    const actor = Number($('actor').value), targetId = Number($('counter-target').value);
    $('actions').innerHTML = E.actions.map(([action, label, rule]) => {
      const validity = E.check(state, action, actor, targetId);
      return '<button data-action="' + action + '" class="' + (validity.ok ? '' : 'unavailable') + '" title="' + esc(validity.ok ? 'Legal nesta janela' : validity.message) + '">' + esc(label) + '<small>' + (validity.ok ? 'Permitido agora' : 'Ver motivo da recusa') + ' · CR ' + rule + '</small></button>';
    }).join('');
  }
  function commit(result) {
    if (!result.ok) { setMessage(result.message, true, result.rule); return; }
    undo.push(state); if (undo.length > 40) undo.shift();
    state = result.state; renderLab(); setMessage(result.message, false, result.rule);
  }
  $('actions').addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    commit(E.apply(state, button.dataset.action, Number($('actor').value), Number($('counter-target').value)));
  });
  $('actor').addEventListener('change', renderActions); $('counter-target').addEventListener('change', renderActions);
  $('pass').addEventListener('click', () => commit(E.pass(state)));
  $('all-pass').addEventListener('click', () => commit(E.allPass(state)));
  $('reset').addEventListener('click', () => {
    state = E.create({ count: Number($('count').value), hasAttackers: $('has-attackers').checked, firstStrike: $('first-strike').checked, cleanupTrigger: $('cleanup-trigger').checked });
    undo = []; renderLab(); setMessage('Exemplo reiniciado na manutenção do primeiro turno.', false, '103; 502; 503');
  });
  $('undo').addEventListener('click', () => { if (!undo.length) return; state = undo.pop(); renderLab(); setMessage('Última ação do laboratório desfeita.', false, ''); });
  $('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ rulesVersion: D.version, educationalOnly: true, state }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = 'commander-estado-didatico.json';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
  const topics = Array.from(new Set(D.scenarios.map(s => s.topic))).sort();
  $('quiz-filter').insertAdjacentHTML('beforeend', topics.map(t => '<option>' + esc(t) + '</option>').join(''));
  function renderQuiz() {
    const filter = $('quiz-filter').value, shown = D.scenarios.filter(s => !filter || s.topic === filter);
    const answered = shown.filter(s => Object.hasOwn(quizAnswers, s.id)), correct = answered.filter(s => quizAnswers[s.id] === s.answer);
    $('quiz-progress').textContent = shown.length + ' situações neste filtro · ' + answered.length + ' respondidas · ' + correct.length + ' corretas. Você pode tentar novamente; a explicação fica ao lado da situação.';
    $('quiz-list').innerHTML = shown.map(s => {
      const picked = quizAnswers[s.id], done = Object.hasOwn(quizAnswers, s.id);
      return '<article class="quiz-card"><p class="eyebrow">' + esc(s.topic) + ' · ' + esc(s.id) + '</p><h3>' + esc(s.question) + '</h3><div class="quiz-options">' + s.options.map((option, i) => '<button data-question="' + esc(s.id) + '" data-option="' + i + '" class="' + (done && i === picked ? i === s.answer ? 'chosen-right' : 'chosen-wrong' : '') + '">' + esc(option) + '</button>').join('') + '</div>' + (done ? '<div class="answer"><strong>' + (picked === s.answer ? 'Correto.' : 'Reveja a regra.') + '</strong> ' + esc(s.explanation) + '<p><strong>Resposta:</strong> ' + esc(s.options[s.answer]) + '</p><button data-rule-query="' + esc(s.rules[0]) + '">Consultar CR ' + esc(s.rules.join(', ')) + '</button></div>' : '') + '</article>';
    }).join('');
  }
  $('quiz-filter').addEventListener('change', renderQuiz);
  $('quiz-list').addEventListener('click', event => {
    const choice = event.target.closest('[data-question]');
    if (choice) { quizAnswers[choice.dataset.question] = Number(choice.dataset.option); try { localStorage.setItem('commander-quiz-20260925', JSON.stringify(quizAnswers)); } catch (_) {} renderQuiz(); }
    const rule = event.target.closest('[data-rule-query]'); if (rule) showRule(rule.dataset.ruleQuery);
  });
  const indexed = D.rules.map(r => Object.assign({}, r, { searchText: norm(r.id + ' ' + r.text) }));
  const glossary = D.glossary.map(g => Object.assign({}, g, { searchText: norm(g.term + ' ' + g.text) }));
  $('topic-links').innerHTML = D.topics.map(t => '<button data-query="' + esc(t.label) + '">' + esc(t.label) + '</button>').join('');
  function idMatch(id, ref) { return id === ref || id.startsWith(ref + '.') || (id.startsWith(ref) && /^[a-z]$/.test(id.slice(ref.length))); }
  function renderSearch() {
    const query = norm($('search').value.trim()).replace(/\.$/, '');
    if (!query) { $('search-status').textContent = D.rules.length + ' entradas de regras + ' + D.glossary.length + ' termos de glossário. Todos os capítulos do manual estão disponíveis offline. Digite um número ou assunto.'; $('search-results').innerHTML = ''; return; }
    const numeric = /^\d{3}(\.\d+[a-z]?)?$/.test(query);
    const matchedTopics = D.topics.filter(t => t.aliases.some(a => norm(a) === query) || norm(t.label) === query);
    const refs = matchedTopics.flatMap(t => t.refs), words = query.split(/\s+/);
    const matches = indexed.filter(r => numeric ? idMatch(r.id, query) : refs.some(ref => idMatch(r.id, ref)) || words.every(w => r.searchText.includes(w)));
    const terms = numeric || refs.length ? [] : glossary.filter(g => words.every(w => g.searchText.includes(w)));
    const total = matches.length + terms.length;
    $('search-status').textContent = total + ' resultados · mostrando até ' + Math.min(total, searchLimit) + '. Texto oficial em inglês; os atalhos de assunto traduzem a busca para os capítulos pertinentes.';
    const records = matches.map(r => ({ title: 'CR ' + r.id, text: r.text, extra: 'Capítulo ' + r.section + ' · linha ' + r.line + ' do TXT local' })).concat(terms.map(g => ({ title: g.term, text: g.text, extra: 'Glossário oficial' })));
    $('search-results').innerHTML = records.slice(0, searchLimit).map(r => '<article class="result"><h3>' + esc(r.title) + '</h3><small>' + esc(r.extra) + '</small><p>' + esc(r.text) + '</p></article>').join('') + (total > searchLimit ? '<button id="more-results">Mostrar mais 50 resultados</button>' : '') + (!total ? '<p>Nenhum resultado. Tente o termo em inglês, um número de regra ou um dos assuntos acima.</p>' : '');
  }
  function showRule(query) { switchTab('rules'); $('search').value = query; searchLimit = 50; renderSearch(); $('search').focus(); }
  document.querySelectorAll('.search-example').forEach(b => b.addEventListener('click', () => showRule(b.dataset.query)));
  $('topic-links').addEventListener('click', event => { const b = event.target.closest('[data-query]'); if (b) showRule(b.dataset.query); });
  $('search-results').addEventListener('click', event => { if (event.target.id === 'more-results') { searchLimit += 50; renderSearch(); } });
  $('search').addEventListener('input', () => { searchLimit = 50; renderSearch(); });
  renderLab(); renderQuiz(); renderSearch();
})();
