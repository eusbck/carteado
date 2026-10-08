/* Laboratório didático: custos/recursos assumidos; efeitos de cartas não implementados. */
(function (root) {
  'use strict';
  const STEPS = {
    upkeep: { name: 'Manutenção', phase: 'Inicial', rule: '503', note: 'Desvirar já aconteceu sem prioridade. Gatilhos de manutenção seriam preparados antes desta janela.' },
    draw: { name: 'Compra', phase: 'Inicial', rule: '504', note: 'A compra normal já aconteceu antes da prioridade exibida aqui.' },
    main1: { name: 'Principal 1', phase: 'Principal pré-combate', rule: '505', note: 'Com prioridade e pilha vazia, o ativo pode usar timing de feitiçaria e jogar terreno disponível.' },
    beginCombat: { name: 'Início do combate', phase: 'Combate', rule: '507', note: 'Janela para agir antes de declarar atacantes.' },
    attackers: { name: 'Atacantes', phase: 'Combate', rule: '508', note: 'A declaração automática do exemplo já aconteceu. Esta prioridade é depois da declaração.' },
    blockers: { name: 'Bloqueadores', phase: 'Combate', rule: '509', note: 'Os bloqueios do exemplo já foram declarados. Esta é a janela antes do primeiro dano.' },
    firstDamage: { name: 'Primeiro dano', phase: 'Combate', rule: '510.4', note: 'O primeiro dano já ocorreu. Há prioridade antes da próxima etapa de dano.' },
    damage: { name: 'Dano de combate', phase: 'Combate', rule: '510', note: 'Atribuição e dano já ocorreram, sem pilha. Esta janela é depois do dano.' },
    combatEnd: { name: 'Fim do combate', phase: 'Combate', rule: '511', note: 'Última janela da fase de combate antes da principal 2.' },
    main2: { name: 'Principal 2', phase: 'Principal pós-combate', rule: '505', note: 'O limite de terreno e o uso de lealdade continuam sendo os do mesmo turno.' },
    end: { name: 'Etapa final', phase: 'Final', rule: '513', note: 'Gatilhos de início da etapa final seriam preparados aqui. Dano ainda não foi limpo.' },
    cleanup: { name: 'Limpeza — exceção', phase: 'Final', rule: '514.3a', note: 'Neste exemplo, um gatilho abriu prioridade excepcional. Ao terminar, haverá outra limpeza.' }
  };
  const ACTIONS = [
    ['land', 'Jogar terreno', '305'], ['sorcery', 'Conjurar feitiçaria', '117.1a'],
    ['creature', 'Conjurar criatura', '117.1a'], ['flash', 'Criatura com flash', '702.8'],
    ['instant', 'Conjurar instantânea', '117.1a'], ['counter', 'Anular uma mágica', '701.6'],
    ['ability', 'Ativar habilidade comum', '602'], ['mana', 'Ativar habilidade de mana', '605'],
    ['loyalty', 'Ativar lealdade', '606'], ['creatureTrigger', 'Criatura com gatilho de entrada', '603']
  ];
  function log(s, text, rule) {
    s.log.push({ text, rule: rule || '', turn: s.turn });
    if (s.log.length > 160) s.log.shift();
  }
  function create(options) {
    const o = Object.assign({ count: 4, hasAttackers: true, firstStrike: false, cleanupTrigger: false }, options || {});
    o.count = Math.max(2, Math.min(6, Math.trunc(Number(o.count)) || 4));
    const names = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eva', 'Felipe'].slice(0, o.count);
    const s = { players: names, options: o, initialPlayers: o.count, active: 0, priority: 0,
      turn: 1, ownTurns: names.map((_, i) => i === 0 ? 1 : 0), step: 'upkeep', passes: 0,
      stack: [], sequence: 0, landPlayed: names.map(() => 0), loyaltyUsed: names.map(() => false),
      cleanupOpened: false, log: [] };
    log(s, 'Mesa de ' + o.count + ' pessoas; preparação e mulligan concluídos. Custos e recursos das ações de treino são assumidos como disponíveis.', '103');
    log(s, 'Ana desvirou: ação automática, sem prioridade.', '502');
    log(s, 'Manutenção: Ana recebe prioridade após as verificações pertinentes.', '117.3a');
    return s;
  }
  function mainTiming(s, actor) { return actor === s.active && ['main1', 'main2'].includes(s.step) && s.stack.length === 0; }
  function check(s, action, actor, targetId) {
    if (!ACTIONS.some(a => a[0] === action)) return { ok: false, message: 'Ação desconhecida.', rule: '' };
    if (!Number.isInteger(actor) || actor < 0 || actor >= s.players.length) return { ok: false, message: 'Jogador inválido.', rule: '102' };
    if (actor !== s.priority) return { ok: false, message: s.players[actor] + ' não tem prioridade. Agora é a vez de ' + s.players[s.priority] + ' agir ou passar.', rule: '117.1' };
    if (['land', 'sorcery', 'creature', 'creatureTrigger', 'loyalty'].includes(action) && !mainTiming(s, actor)) {
      return { ok: false, message: 'Esta ação exige ser o jogador ativo, na própria fase principal, com prioridade e pilha vazia.', rule: action === 'land' ? '305.1' : action === 'loyalty' ? '606.3' : '117.1a' };
    }
    if (action === 'land' && s.landPlayed[actor] >= 1) return { ok: false, message: 'A jogada normal de terreno deste turno já foi usada. A principal 2 não renova o limite.', rule: '305.2' };
    if (action === 'loyalty' && s.loyaltyUsed[actor]) return { ok: false, message: 'O planeswalker de treino já teve lealdade ativada neste turno.', rule: '606.3' };
    if (action === 'counter') {
      const target = s.stack.find(x => x.id === targetId);
      if (!target || target.kind !== 'spell') return { ok: false, message: 'A anulação deste exemplo exige uma mágica na pilha como alvo; não atinge habilidades ou permanentes.', rule: '115' };
    }
    return { ok: true };
  }
  function push(s, data) { s.stack.push(Object.assign({ id: ++s.sequence }, data)); }
  function apply(s, action, actor, targetId) {
    const validity = check(s, action, actor, targetId);
    if (!validity.ok) return Object.assign({ state: s }, validity);
    const next = JSON.parse(JSON.stringify(s));
    next.passes = 0;
    const who = next.players[actor];
    if (action === 'land') {
      next.landPlayed[actor]++;
      log(next, who + ' joga o terreno de treino. Não usa pilha; conserva prioridade.', '305; 117.3c');
    } else if (action === 'mana') {
      log(next, who + ' ativa uma habilidade que satisfaz CR 605.1: resolve imediatamente, sem pilha. A reserva de mana não é contabilizada neste laboratório.', '605.3b');
    } else {
      const label = ACTIONS.find(a => a[0] === action)[1];
      const isAbility = ['ability', 'loyalty'].includes(action);
      if (action === 'loyalty') next.loyaltyUsed[actor] = true;
      push(next, { label, controller: actor, kind: isAbility ? 'ability' : 'spell', action,
        targetId: action === 'counter' ? targetId : null });
      log(next, who + ' coloca #' + next.sequence + ' (' + label + ') no topo' + (action === 'counter' ? ', mirando #' + targetId : '') + '. Custos pagos na premissa; ' + who + ' conserva prioridade.', '117.3c');
    }
    return { ok: true, state: next, message: 'Ação legal no exemplo. ' + who + ' continua com prioridade.', rule: '117.3c' };
  }
  function resolve(s) {
    const object = s.stack.pop();
    if (object.action === 'counter') {
      const at = s.stack.findIndex(x => x.id === object.targetId && x.kind === 'spell');
      if (at < 0) log(s, '#' + object.id + ' não resolve: seu único alvo não está mais legal na pilha.', '608.2b');
      else {
        const removed = s.stack.splice(at, 1)[0];
        log(s, '#' + object.id + ' resolve e anula #' + removed.id + ' (' + removed.label + '). Os custos não são devolvidos.', '701.6');
      }
    } else {
      log(s, 'Resolve somente #' + object.id + ' (' + object.label + '). Efeito abstrato de treino concluído.', '117.4; 608');
    }
    log(s, 'Antes da prioridade: verificar ações de estado repetidamente e preparar gatilhos. O laboratório não calcula características nem condições de derrota.', '117.5');
    if (object.action === 'creatureTrigger') {
      push(s, { label: 'Gatilho de entrada da criatura de treino', controller: object.controller, kind: 'ability', action: 'trigger', targetId: null });
      log(s, 'A entrada disparou a habilidade #' + s.sequence + ', colocada na pilha antes da prioridade. Ela não foi uma nova conjuração.', '603.3');
    }
    s.priority = s.active;
    s.passes = 0;
    log(s, s.players[s.active] + ', jogador ativo, recebe prioridade após a resolução.', '117.3b');
  }
  function newTurn(s) {
    s.active = (s.active + 1) % s.players.length;
    s.priority = s.active;
    s.turn++;
    s.ownTurns[s.active]++;
    s.passes = 0;
    s.landPlayed.fill(0);
    s.loyaltyUsed.fill(false);
    s.cleanupOpened = false;
    s.step = 'upkeep';
    log(s, 'Começa o turno de ' + s.players[s.active] + '. Limites do novo turno são preparados.', '500');
    log(s, s.players[s.active] + ' desvira sem prioridade; avança para a manutenção.', '502');
    log(s, s.players[s.active] + ' recebe prioridade na manutenção.', '117.3a');
  }
  function cleanup(s) {
    s.step = 'cleanup';
    log(s, 'Limpeza: descarte até o limite se necessário; dano marcado removido e efeitos até o fim do turno encerrados.', '514.1; 514.2');
    if (s.options.cleanupTrigger && !s.cleanupOpened) {
      s.cleanupOpened = true;
      push(s, { label: 'Gatilho de treino causado pelo descarte na limpeza', controller: s.active, kind: 'ability', action: 'trigger', targetId: null });
      s.priority = s.active;
      s.passes = 0;
      log(s, 'Premissa do exemplo: o descarte necessário disparou esta habilidade. Abre prioridade excepcional; depois haverá outra limpeza.', '514.3a');
    } else {
      log(s, 'Nenhum gatilho/ação de estado exige janela na limpeza. Não há prioridade; segue o próximo turno.', '514.3');
      newTurn(s);
    }
  }
  function advance(s) {
    const transitions = { upkeep: 'draw', draw: 'main1', main1: 'beginCombat', beginCombat: 'attackers',
      attackers: s.options.hasAttackers ? 'blockers' : 'combatEnd',
      blockers: s.options.firstStrike ? 'firstDamage' : 'damage', firstDamage: 'damage',
      damage: 'combatEnd', combatEnd: 'main2', main2: 'end' };
    log(s, 'Todos passaram consecutivamente com pilha vazia: termina ' + STEPS[s.step].name + '.', '117.4');
    if (s.step === 'end' || s.step === 'cleanup') { cleanup(s); return; }
    let destination = transitions[s.step];
    if (destination === 'draw' && s.initialPlayers === 2 && s.active === 0 && s.ownTurns[0] === 1) {
      log(s, 'A partida começou com dois jogadores: o primeiro pula sua etapa de compra do primeiro turno.', '103.8a');
      destination = 'main1';
    }
    s.step = destination;
    s.priority = s.active;
    s.passes = 0;
    if (destination === 'draw') log(s, s.players[s.active] + ' compra a carta normal da etapa ANTES de receber prioridade. Compra abstrata, sem deck real.', '504.1');
    if (destination === 'attackers') log(s, s.options.hasAttackers ? 'Atacantes do exemplo são declarados automaticamente antes da prioridade. Criaturas, custos de ataque e gatilhos particulares são premissas.' : 'Nenhum atacante é declarado. Após esta janela, serão puladas as etapas de bloqueadores e dano.', '508.1; 506.1');
    if (destination === 'blockers') log(s, 'Bloqueios do exemplo foram declarados antes da prioridade. Agora há janela antes do dano; resultados não são calculados.', '509.1');
    if (destination === 'firstDamage' || destination === 'damage') log(s, 'Atribuição e aplicação do ' + (destination === 'firstDamage' ? 'primeiro ' : '') + 'dano já ocorreram SEM pilha, antes desta janela. Nenhuma ação pode ser inserida entre atribuição e aplicação.', '510.1; 510.2');
    log(s, STEPS[destination].name + ': preparar ações de estado/gatilhos pertinentes; ' + s.players[s.active] + ' recebe prioridade.', '117.3a; 117.5');
  }
  function pass(s) {
    const next = JSON.parse(JSON.stringify(s));
    log(next, next.players[next.priority] + ' passa prioridade (' + (next.passes + 1) + '/' + next.players.length + ').', '117.3d');
    next.passes++;
    if (next.passes === next.players.length) {
      if (next.stack.length) resolve(next); else advance(next);
    } else next.priority = (next.priority + 1) % next.players.length;
    return { ok: true, state: next, message: 'Prioridade passada. Agora: ' + next.players[next.priority] + '.', rule: '117.4' };
  }
  function allPass(s) {
    let result;
    const remaining = s.players.length - s.passes;
    for (let i = 0; i < remaining; i++) { result = pass(i === 0 ? s : result.state); }
    return result;
  }
  const api = { create, check, apply, pass, allPass, steps: STEPS, actions: ACTIONS };
  root.CommanderEngine = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
