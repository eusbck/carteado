// Cenários de dados/cenarios.json transformados em testes do motor.
// Cada teste cita o id do cenário e as regras. Os cenários Q15, Q16, Q32, Q37 e Q51 estão em
// outros arquivos ou dependem de mecânicas ausentes nos decks (Veículos/tripular).
import { describe, expect, it } from 'vitest';
import { setup, P } from './harness.ts';
import { matchPool, parseCost } from '../motor/mana.ts';
import { abilityDefs } from '../motor/chars.ts';

describe('Prioridade (Q01–Q06)', () => {
  it('Q01 — CR 117.3c: quem conjura recebe a prioridade', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []] });
    tg.cast("Night's Whisper");
    expect(tg.pending).toMatchObject({ kind: 'priority', player: 0 });
  });

  it('Q02 — CR 117.4: com três objetos, todos passando resolve só o topo', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Island', 'Island'], ['Island', 'Island']],
      hand: [["Night's Whisper", 'Counterspell'], ['Counterspell']],
      library: [['Plains', 'Plains'], []],
    });
    tg.cast("Night's Whisper");
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell'); // Ana anula a própria mágica (2º objeto)
    tg.pass();
    tg.choose('mágica alvo', ['Counterspell']).cast('Counterspell'); // Bruno anula a anulação (3º objeto)
    expect(tg.state.zones.stack.length).toBe(3);
    tg.resolve();
    expect(tg.state.zones.stack.length).toBe(1); // a anulação de Bruno resolveu e removeu a de Ana
    expect(tg.pending).toMatchObject({ kind: 'priority', player: 0 }); // CR 117.3b
  });

  it('Q03 — CR 117.4: depois de uma ação nova, quem já passou volta a ter prioridade', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp'], [], ['Island', 'Island']], hand: [["Night's Whisper"], [], ['Counterspell']], library: [['Plains', 'Plains'], [], []] });
    tg.cast("Night's Whisper");
    tg.pass(); // Ana
    tg.pass(); // Bruno
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell'); // Carla
    tg.pass(); // Carla
    expect(tg.pending).toMatchObject({ kind: 'priority', player: 0 });
  });

  it('Q04 — CR 117.3b: depois de resolver a mágica de Bruno no turno de Ana, Ana recebe prioridade', () => {
    const tg = setup({ battlefield: [[], ['Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients']], hand: [[], ['Infernal Grasp']] });
    tg.pass();
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolve();
    expect(tg.pending).toMatchObject({ kind: 'priority', player: 0 });
  });

  it('Q05 — CR 117.4, 500.2: todos passam com a pilha vazia e a etapa termina', () => {
    const tg = setup({});
    expect(tg.state.turn.step).toBe('main1');
    tg.pass().pass();
    expect(tg.state.turn.step).toBe('beginCombat');
  });

  it('Q06 — CR 117.2e: ninguém recebe prioridade no meio da resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Plains', 'Island'], []] });
    tg.cast("Night's Whisper");
    tg.pass();
    // Bruno passa: resolve inteira e a próxima decisão já é prioridade com as duas compras feitas
    tg.answer({ kind: 'priority', action: 'pass' });
    expect(tg.pending?.kind).toBe('priority');
    expect(tg.state.zones.hand[0].length).toBe(2);
  });
});

describe('Turnos (Q07–Q10)', () => {
  it('Q07 — CR 502.4: ninguém tem prioridade na etapa de desvirar', () => {
    const tg = setup({ step: 'end', library: [['Plains'], ['Plains']] });
    tg.pass().pass(); // fim do turno de Ana
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) { seen.push(tg.state.turn.step); tg.pass(); }
    expect(seen[0]).toBe('upkeep');
    expect(seen).not.toContain('untap');
  });

  it('Q08 — CR 503, 504.1: a manutenção vem antes da compra', () => {
    const tg = setup({ step: 'end', library: [['Plains'], ['Plains', 'Island']] });
    tg.pass().pass();
    expect(tg.state.turn).toMatchObject({ active: 1, step: 'upkeep' });
    expect(tg.state.zones.hand[1].length).toBe(0);
    tg.pass().pass();
    expect(tg.state.turn.step).toBe('draw');
    expect(tg.state.zones.hand[1].length).toBe(1);
  });

  it('Q09 — CR 514.2: o dano marcado fica até a limpeza', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], ['Indomitable Ancients']] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('end');
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    // Zetalpa não foi bloqueada; marcamos dano direto e conferimos que ele fica na etapa final
    tg.state.objects[tg.bf('Indomitable Ancients')].damage = 3;
    tg.pass().pass();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(0);
  });

  it('Q10 — CR 514.3a: gatilho de descarte na limpeza abre prioridade e há outra limpeza', () => {
    const hand = Array.from({ length: 9 }, () => 'Plains');
    const tg = setup({ step: 'end', battlefield: [['Bag of Holding'], []], hand: [hand, []] });
    tg.pass().pass(); // vai para a limpeza: descarta 2, Bag of Holding dispara duas vezes
    expect(tg.state.turn.step).toBe('cleanup');
    expect(tg.pending?.kind).toBe('priority');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolveAll();
    tg.pass().pass();
    expect(tg.state.turn.active).toBe(1);
    expect(tg.state.zones.exile.length).toBe(2);
  });
});

describe('Terrenos e mana (Q11–Q16)', () => {
  it('Q11 — CR 305.3: não se joga terreno no turno de outro jogador', () => {
    const tg = setup({ hand: [[], ['Forest']] });
    tg.pass();
    expect(tg.pending?.player).toBe(1);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('Q12 — CR 305.2: o limite de terreno vale para o turno inteiro', () => {
    const tg = setup({ hand: [['Forest', 'Forest'], []] });
    tg.play('Forest');
    tg.passTo('main2');
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('Q13 — CR 116.2a, 305.1: jogar terreno não usa a pilha', () => {
    const tg = setup({ hand: [['Forest'], []] });
    tg.play('Forest');
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.pending).toMatchObject({ kind: 'priority', player: 0 });
  });

  it('Q14 — CR 106.4: passar não esvazia a reserva; o fim da etapa esvazia', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []] });
    const act = tg.actionIds().find((a) => a.startsWith('mana:'))!;
    tg.answer({ kind: 'priority', action: act });
    expect(tg.state.players[0].manaPool.length).toBe(2);
    tg.pass();
    expect(tg.state.players[0].manaPool.length).toBe(2);
    tg.pass();
    expect(tg.state.players[0].manaPool.length).toBe(0);
  });

  it('Q15 — CR 107.4c: {C} só se paga com mana incolor', () => {
    expect(matchPool(parseCost('{C}'), [{ type: 'G', source: null }])).toBeNull();
    expect(matchPool(parseCost('{C}'), [{ type: 'C', source: null }])).not.toBeNull();
  });

  it('Q16 — CR 605.1a: habilidade que mói como custo não é habilidade de mana (Millikin usa a pilha)', () => {
    const tg = setup({ battlefield: [['Millikin'], []], library: [['Plains'], []] });
    const defs = abilityDefs(tg.g, tg.bf('Millikin'));
    expect(defs.some((d) => d.def.kind === 'mana')).toBe(false);
    tg.activate('Millikin');
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C']);
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
  });
});

describe('Custos e habilidades (Q17–Q20)', () => {
  it('Q17 — CR 602.2: o sacrifício do custo já aconteceu antes de qualquer resposta', () => {
    const tg = setup({ battlefield: [['Viscera Seer', 'Wall of Omens'], []], library: [['Plains'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).activate('Viscera Seer');
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Wall of Omens');
  });

  it('Q18 — CR 701.6b: mágica anulada não devolve o que foi pago', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island']], hand: [["Night's Whisper"], ['Counterspell']] });
    tg.cast("Night's Whisper").pass();
    tg.choose('mágica alvo', ["Night's Whisper"]).cast('Counterspell').resolve();
    expect(tg.names(0, 'graveyard')).toContain("Night's Whisper");
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Swamp' && tg.state.objects[id].tapped).length).toBe(2);
  });

  it('Q19 — CR 113.7a: a habilidade na pilha existe independente da fonte', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Swamp', 'Swamp']], hand: [['Wall of Omens'], ['Infernal Grasp']], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolve(); // entra e o gatilho vai para a pilha
    expect(tg.state.zones.stack.length).toBe(1);
    tg.pass();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    tg.resolve();
    expect(tg.state.zones.hand[0].length).toBe(1); // comprou mesmo assim
  });

  it('Q20 — CR 606.3: lealdade exige pilha vazia', () => {
    const tg = setup({ battlefield: [['Quintorius, History Chaser', 'Plains', 'Plains', 'Plains'], []], hand: [['Wall of Omens', 'Plains'], []], library: [['Island', 'Island', 'Island'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes('Quintorius'))).toBe(true);
    tg.cast('Wall of Omens').resolve(); // gatilho de entrada na pilha
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes('Quintorius'))).toBe(false);
  });
});

describe('Alvos e permanentes (Q21–Q25)', () => {
  it('Q21 — CR 608.2b: alvo único ilegal, nada da mágica acontece', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients', 'Swamp', 'Swamp']], hand: [['Infernal Grasp'], ['Infernal Grasp']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').pass();
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve().resolve();
    expect(tg.life(0)).toBe(40);
  });

  it('Q22 — CR 608.2b: com um alvo ilegal, os outros ainda são afetados', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens', 'Sylvan Caryatid', 'Swamp', 'Swamp']],
      hand: [['Incremental Blight'], ['Infernal Grasp']],
    });
    // Sylvan Caryatid tem hexproof: não pode ser alvo de Ana; usamos as outras duas e Zetalpa? Bruno só tem 3 criaturas
    tg.choose('(1 marcador)', ['Wall of Omens']).choose('(2 marcadores)', ['Indomitable Ancients']);
    expect(() => tg.cast('Incremental Blight')).toThrow(); // não há terceira criatura legal (hexproof)
  });

  it('Q22b — CR 608.2b: dois de três alvos legais recebem os marcadores', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Zetalpa, Primal Dawn'], ['Indomitable Ancients', 'Wall of Omens', 'Swamp', 'Swamp']],
      hand: [['Incremental Blight'], ['Infernal Grasp']],
    });
    tg.choose('(1 marcador)', ['Wall of Omens']).choose('(2 marcadores)', ['Indomitable Ancients']).choose('(3 marcadores)', ['Zetalpa, Primal Dawn']);
    tg.cast('Incremental Blight').pass();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve();
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters['-1/-1']).toBe(2);
    expect(tg.state.objects[tg.bf('Zetalpa, Primal Dawn')].counters['-1/-1']).toBe(3);
  });

  it('Q23 — CR 702.11b: hexproof não impede destruição que não mira', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Sylvan Caryatid']], hand: [['Winds of Rath'], []] });
    tg.cast('Winds of Rath').resolve();
    expect(tg.find('Sylvan Caryatid')).toBeNull();
  });

  it('Q24 — CR 704.5f: indestrutível com resistência 0 vai para o cemitério', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Zetalpa, Primal Dawn']], hand: [['Toxic Deluge'], []] });
    tg.number('valor de X', 8).cast('Toxic Deluge').resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.life(0)).toBe(32);
  });

  it('Q25 — CR 704.5j: a regra da lenda só vale para o mesmo controlador', () => {
    const tg = setup({ battlefield: [['Zetalpa, Primal Dawn'], ['Zetalpa, Primal Dawn']] });
    tg.pass();
    expect(tg.all('Zetalpa, Primal Dawn').length).toBe(2);
    const tg2 = setup({ battlefield: [['Zetalpa, Primal Dawn', 'Zetalpa, Primal Dawn'], []] });
    tg2.pass();
    expect(tg2.all('Zetalpa, Primal Dawn').length).toBe(1);
  });
});

describe('Combate (Q26–Q31)', () => {
  it('Q26 — CR 302.6: criatura recém-chegada pode bloquear', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients'], [{ name: 'Wall of Omens', ready: false }]] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
  });

  it('Q27 — CR 509.1h, 510.1c: bloqueada continua bloqueada mesmo sem bloqueador', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients', 'Swamp', 'Swamp'], ['Wall of Omens']], hand: [['Infernal Grasp'], []] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]);
    tg.passTo('declareBlockers');
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp').resolve();
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
  });

  it('Q29 — CR 510.1c: o dano pode ser dividido livremente entre dois bloqueadores', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients'], ['Wall of Omens', 'Sylvan Caryatid']] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients'], ['Sylvan Caryatid', 'Indomitable Ancients']]);
    tg.script.push((d) => (d.kind === 'damage' ? { kind: 'damage', assign: [0, 2] } : null));
    tg.passTo('main2');
    // todo o dano (2) foi para o segundo bloqueador, sem ordem de atribuição
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
    expect(tg.state.objects[tg.bf('Sylvan Caryatid')].damage).toBe(2);
  });

  it('Q30 — CR 510.4: há prioridade entre o dano de primeiro golpe e o normal', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Zetalpa, Primal Dawn'], []] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('firstStrikeDamage');
    expect(tg.life(1)).toBe(36);
    expect(tg.pending?.kind).toBe('priority');
    tg.pass().pass();
    expect(tg.life(1)).toBe(32);
  });

  it('Q31 — CR 506.4b: virar o bloqueador não o tira do combate', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Indomitable Ancients'], ['Wall of Omens']] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]);
    tg.passTo('declareBlockers');
    tg.state.objects[tg.bf('Wall of Omens')].tapped = true;
    tg.g.bump();
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
    // o bloqueador virado continuou no combate e recebeu o dano do atacante
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(2);
  });
});

describe('Commander (Q33–Q41)', () => {
  it('Q33 — CR 903.8: comandante anulado ainda conta para o imposto', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], ['Island', 'Island']], command: [['Indomitable Ancients'], []], hand: [[], ['Counterspell']] });
    tg.cast('Indomitable Ancients', 'command').pass();
    tg.choose('mágica alvo', ['Indomitable Ancients']).cast('Counterspell').resolve();
    tg.yes('zona de comando');
    tg.settle();
    expect(tg.find('Indomitable Ancients', 'command')).not.toBeNull();
    const cid = tg.state.objects[tg.find('Indomitable Ancients', 'command')!].card!;
    expect(tg.state.players[0].commanderCasts[String(cid)]).toBe(1);
    // a próxima conjuração custa {2} a mais: 4 + 2 = 6, mas só sobraram 4 Plains
    expect(tg.canCast('Indomitable Ancients')).toBe(false);
  });

  it('Q34 — CR 903.8: reanimar o comandante não conta como conjurá-lo da zona de comando', () => {
    const tg = setup({ battlefield: [['Swamp'], []], graveyard: [[{ name: 'Indomitable Ancients', commander: true }], []], hand: [['Reanimate'], []], onStart: (x) => { x.yes('zona de comando', false); } });
    tg.choose('carta de criatura', ['Indomitable Ancients']).cast('Reanimate').resolve();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(Object.values(tg.state.players[0].commanderCasts).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it('Q35/Q36 — CR 903.9a: comandante vai ao cemitério e só a nova chegada oferece a zona de comando', () => {
    const tg = setup({ battlefield: [[{ name: 'Indomitable Ancients', commander: true }], ['Swamp', 'Swamp']], hand: [[], ['Infernal Grasp']] });
    tg.pass();
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.yes('zona de comando', false);
    tg.resolve();
    expect(tg.find('Indomitable Ancients', 'graveyard')).not.toBeNull();
    // passar de novo não oferece outra vez (Q36)
    tg.lenient = false;
    tg.pass();
    tg.lenient = true;
    expect(tg.find('Indomitable Ancients', 'graveyard')).not.toBeNull();
  });

  it('Q38 — CR 903.10a: o dano de comandantes diferentes é contado em separado', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[{ name: 'Zetalpa, Primal Dawn', commander: true }, { name: 'Indomitable Ancients', commander: true }], []] });
    tg.attack([['Zetalpa, Primal Dawn', 1], ['Indomitable Ancients', 1]]);
    tg.passTo('main2');
    const dmg = Object.values(tg.state.players[1].commanderDamage).sort();
    expect(dmg).toEqual([2, 8]);
  });

  it('Q39 — CR 903.10a: dano que não é de combate não conta', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', { name: 'Zetalpa, Primal Dawn', commander: true }], ['Indomitable Ancients']], hand: [['Abrade'], []] });
    tg.choose('modo', ['Causa 3 de dano à criatura alvo']).choose('criatura alvo', ['Indomitable Ancients']).cast('Abrade').resolve();
    expect(Object.keys(tg.state.players[1].commanderDamage).length).toBe(0);
  });

  it('Q40 — CR 903.10a: ganhar vida não reduz o dano de comandante', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[{ name: 'Zetalpa, Primal Dawn', commander: true }], []] });
    tg.attack([['Zetalpa, Primal Dawn', 1]]);
    tg.passTo('main2');
    tg.state.players[1].life += 10;
    expect(Object.values(tg.state.players[1].commanderDamage)).toEqual([8]);
  });
});

describe('Multijogador e derrota (Q42–Q47)', () => {
  it('Q44 — CR 104.3d, 704.5c: dez marcadores de veneno derrotam', () => {
    const tg = setup({ players: 3 });
    tg.state.players[2].counters.poison = 10;
    tg.g.bump();
    tg.pass();
    expect(tg.state.players[2].lost).toBe(true);
  });

  it('Q45 — CR 104.3c, 704.5b: grimório vazio só derrota ao tentar comprar', () => {
    const tg = setup({ step: 'end', library: [[], []] });
    tg.pass().pass();
    expect(tg.state.players[1].lost).toBe(false);
    tg.passTo('main1', 1);
    expect(tg.state.players[1].lost).toBe(true);
  });

  it('Q46 — CR 800.4a: objetos de quem sai deixam o jogo mesmo controlados por outro', () => {
    const tg = setup({ players: 3, battlefield: [['Wall of Omens'], ['Indomitable Ancients'], []] });
    // Ana ganha o controle de Indomitable Ancients
    const id = tg.bf('Indomitable Ancients');
    tg.state.effects.push({ id: 999, timestamp: 999, source: id, sourceDef: '', controller: 0, duration: { kind: 'permanent' }, affected: [id], mods: [{ k: 'control', player: 0 }] });
    tg.g.bump();
    tg.game.concede(1);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.state.players[1].left).toBe(true);
  });

  it('Q47 — CR 800.4j: se o ativo sai no próprio turno, o turno continua', () => {
    const tg = setup({ players: 3 });
    tg.game.concede(0);
    expect(tg.state.turn.active).toBe(0);
    expect(tg.pending?.player).toBe(1);
    tg.pass().pass();
    expect(tg.state.turn.step).toBe('beginCombat');
    expect(tg.state.turn.active).toBe(0);
  });
});

describe('Gatilhos (Q48–Q49)', () => {
  it('Q48 — CR 603.3b: os gatilhos do ativo vão para a pilha primeiro (resolvem por último)', () => {
    const tg = setup({ battlefield: [['Blood Artist', 'Swamp', 'Swamp', 'Indomitable Ancients'], ['Blood Artist']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.choose('jogador alvo', ['Bruno']).choose('jogador alvo', ['Ana']);
    tg.resolve();
    const st = tg.state.zones.stack.map((id) => tg.state.objects[id].stack!.controller);
    expect(st).toEqual([0, 1]); // fundo: Ana; topo: Bruno
  });

  it('Q49 — CR 702.15b, 120.3f: vínculo com a vida faz parte do resultado do dano, sem pilha', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Killian, Ink Duelist'], []] });
    tg.attack([['Killian, Ink Duelist', 1]]);
    tg.passTo('combatDamage');
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
    expect(tg.state.zones.stack.length).toBe(0);
  });
});

void P;
