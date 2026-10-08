// Regras do lote D: tóxico e veneno (CR 702.164, 120.3g, 704.5c), corrompido, emblemas (CR 114), "não pode perder o
// jogo" (CR 104.3), "não pode receber marcadores" (CR 122), marcadores de atordoamento (CR 122.1d), proteção contra
// tipo de carta e de jogador (CR 702.16), mana não gasta que vira incolor (CR 106.4, 500.5) e o monarca que sai da
// partida (CR 725.4).
import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from './harness.ts';
import {
  addCounters, addEffect, addMana, attach, blight, corrupted, createEmblem, dealDamage, defineAbility, defineEmblem, isEmblem,
  on, putOntoBattlefield, staticAbility, toxicValue, triggered, gainLife, untap,
} from '../motor/api.ts';
import { blightCandidates, protectionMatches } from '../motor/actions.ts';
import { chars, hasKw, kwParams } from '../motor/chars.ts';
import { validateManual } from '../motor/manual.ts';
import { legalActions } from '../motor/priority.ts';
import { buildView } from '../motor/view.ts';
import type { Mod } from '../motor/types.ts';

// habilidades de teste, ligadas por efeitos de regra (Mod { k: 'rule' })
defineAbility('teste:naoPerde', { kind: 'static', rules: { cantLoseGame: (c, p) => p === c.you } });
defineAbility('teste:semMenos', { kind: 'static', rules: { cantHaveCountersPut: (c, kind, a) => kind === '-1/-1' && a.controller === c.you && a.chars.types.includes('Creature') } });
defineAbility('teste:protInstantanea', { kind: 'static', rules: { playerProtection: (c, p) => (p === c.you ? ['type:Instant'] : []) } });
defineAbility('teste:protCriatura', { kind: 'static', rules: { playerProtection: (c, p) => (p === c.you ? ['type:Creature'] : []) } });
defineAbility('teste:manaIncolor', { kind: 'static', rules: { unspentManaBecomesColorless: (c, p) => p === c.you } });

defineEmblem({
  id: 'teste:emblema', name: 'Emblema de teste',
  abilities: [
    staticAbility({ affects: (c, o) => o.controller === c.you && chars(c.g, o.id).types.includes('Creature'), mods: () => [{ k: 'pt', p: 1, t: 1 }], text: 'As criaturas que você controla recebem +1/+1.' }),
    triggered(on.upkeep('you'), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'No início da sua manutenção, você ganha 1 de vida.' }),
  ],
});

function regra(tg: TestGame, id: string, controller = 0): number {
  const e = addEffect(tg.g, { source: -1, sourceDef: '', controller, duration: { kind: 'permanent' }, affected: null, mods: [{ k: 'rule', id }] });
  tg.refresh();
  return e.id;
}

function semRegra(tg: TestGame, id: number): void {
  tg.state.effects = tg.state.effects.filter((e) => e.id !== id);
  tg.g.bump();
  tg.refresh();
}

function efeito(tg: TestGame, obj: number, mods: Mod[]): void {
  addEffect(tg.g, { source: obj, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [obj], mods });
  tg.refresh();
}

const mite = { name: 'Phyrexian Mite', token: true };

describe('tóxico e veneno (CR 702.164, 120.3g)', () => {
  it('CR 702.164b: instâncias de tóxico se somam no valor tóxico total', () => {
    const tg = setup({ battlefield: [[mite], []] });
    const m = tg.bf('Phyrexian Mite');
    efeito(tg, m, [{ k: 'addKeyword', kw: 'toxic', param: 2 }]);
    expect(toxicValue(tg.g, m)).toBe(3);
    tg.attack([['Phyrexian Mite', 1]]).passTo('main2');
    expect(tg.state.players[1].counters.poison).toBe(3);
    expect(tg.life(1)).toBe(39);
    // a mesa recebe os marcadores de veneno do jogador
    expect(buildView(tg.g, 0, null).players[1].counters.poison).toBe(3);
  });

  it('CR 702.164c: dano que não é de combate não dá veneno', () => {
    const tg = setup({ battlefield: [[mite], []] });
    dealDamage(tg.g, [{ source: tg.bf('Phyrexian Mite'), target: { kind: 'player', id: 1 }, amount: 1, combat: false }]);
    tg.refresh();
    expect(tg.life(1)).toBe(39);
    expect(tg.state.players[1].counters.poison ?? 0).toBe(0);
  });

  it('CR 704.5c: com dez marcadores de veneno, o jogador perde', () => {
    const tg = setup({ battlefield: [[mite], []] });
    tg.state.players[1].counters.poison = 9;
    tg.g.bump();
    tg.refresh();
    tg.attack([['Phyrexian Mite', 1]]).passTo('main2');
    expect(tg.state.players[1].lost).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('corrompido: algum oponente com três ou mais marcadores de veneno (os seus não contam)', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []] });
    tg.state.players[0].counters.poison = 5;
    tg.state.players[2].counters.poison = 2;
    expect(corrupted(tg.g, 0)).toBe(false);
    tg.state.players[2].counters.poison = 3;
    expect(corrupted(tg.g, 0)).toBe(true);
    expect(corrupted(tg.g, 2)).toBe(true); // Ana tem 5
    expect(corrupted(tg.g, 1)).toBe(true);
  });
});

describe('emblemas (CR 114)', () => {
  it('CR 114.2-114.5: vai para a zona de comando, é de quem recebe; as habilidades funcionam de lá', () => {
    const tg = setup({ players: 3, battlefield: [['Wall of Omens'], ['Indomitable Ancients'], []], library: [['Plains'], ['Island'], ['Island']] });
    const em = createEmblem(tg.g, 0, 'teste:emblema')!;
    tg.refresh();
    const o = tg.state.objects[em];
    expect(o.zone).toBe('command');
    expect([o.owner, o.controller, o.card]).toEqual([0, 0, null]);
    expect(isEmblem(tg.g, em)).toBe(true);
    const c = chars(tg.g, em);
    expect([c.types, c.colors, c.manaCost]).toEqual([[], [], null]);
    // estática: só as criaturas do dono
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([1, 5]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    // não é carta: não se conjura nem aparece nas ações
    expect(legalActions(tg.g, 0).some((a) => a.obj === em)).toBe(false);
    // gatilho: na manutenção do dono
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.life(0)).toBe(41);
    // a mesa mostra o emblema a todos, marcado e com o texto das habilidades
    const v = buildView(tg.g, 1, null).command.find((x) => x.id === em)!;
    expect(v.emblem).toBe(true);
    expect(v.owner).toBe(0);
    expect(v.abilities).toEqual(['As criaturas que você controla recebem +1/+1.', 'No início da sua manutenção, você ganha 1 de vida.']);
  });

  it('CR 114.5: o ajuste manual não move emblemas', () => {
    const tg = setup({ battlefield: [[], []] });
    tg.state.config.manualMode = true;
    const em = createEmblem(tg.g, 0, 'teste:emblema')!;
    expect(validateManual(tg.g, 0, { k: 'mover', obj: em, to: 'battlefield' })).toMatch(/Emblema/);
  });

  it('CR 800.4a: o emblema sai com o dono quando ele sai da partida', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []] });
    const em = createEmblem(tg.g, 1, 'teste:emblema')!;
    tg.refresh();
    tg.game.concede(1);
    expect(tg.state.objects[em]).toBeUndefined();
    expect(tg.state.zones.command).toEqual([]);
  });
});

describe('não pode perder o jogo (CR 104.3)', () => {
  it('vida 0 não faz perder enquanto o efeito existe; sem ele, perde na próxima verificação', () => {
    const tg = setup({ battlefield: [[], []] });
    const ef = regra(tg, 'teste:naoPerde');
    tg.state.players[0].life = -3;
    tg.g.bump();
    tg.refresh();
    expect(tg.state.players[0].left).toBe(false);
    expect(tg.pending?.kind).toBe('priority'); // a verificação de ações de estado não fica em laço
    semRegra(tg, ef);
    expect(tg.state.players[0].lost).toBe(true);
  });

  it('CR 104.3a: conceder continua valendo', () => {
    const tg = setup({ battlefield: [[], []] });
    regra(tg, 'teste:naoPerde');
    tg.game.concede(0);
    expect(tg.state.players[0].left).toBe(true);
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });
});

describe('não pode receber marcadores (CR 122)', () => {
  it('marcadores -1/-1 não são postos; +1/+1 sim; nem dano de murchar, nem ao entrar', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], ['Village Pillagers', 'Indomitable Ancients']], hand: [['Wickerbough Elder'], []] });
    regra(tg, 'teste:semMenos');
    const w = tg.bf('Wall of Omens');
    expect(addCounters(tg.g, { kind: 'obj', id: w }, '-1/-1', 2, 1)).toBe(0);
    expect(addCounters(tg.g, { kind: 'obj', id: w }, '+1/+1', 1, 0)).toBe(1);
    expect(addCounters(tg.g, { kind: 'obj', id: tg.bf('Indomitable Ancients') }, '-1/-1', 1, 1)).toBe(1);
    dealDamage(tg.g, [{ source: tg.bf('Village Pillagers'), target: { kind: 'obj', id: w }, amount: 3, combat: false }]);
    expect(tg.state.objects[w].counters).toEqual({ '+1/+1': 1 });
    expect(tg.state.objects[w].damage).toBe(0);
    const elder = tg.find('Wickerbough Elder', 'hand')!;
    const [novo] = tg.run(putOntoBattlefield(tg.g, [{ id: elder, controller: 0, counters: { '-1/-1': 2 } }], 'effect'));
    expect(tg.state.objects[novo].counters).toEqual({});
  });

  it('CR 701.68b: sem criatura que possa receber marcadores -1/-1, não há blight', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], ['Indomitable Ancients']] });
    regra(tg, 'teste:semMenos');
    expect(blightCandidates(tg.g, 0)).toEqual([]);
    expect(tg.run(blight(tg.g, 0, 1))).toBeNull();
    expect(blightCandidates(tg.g, 1)).toEqual([tg.bf('Indomitable Ancients')]);
  });
});

describe('marcadores de atordoamento (CR 122.1d)', () => {
  it('permanente virado com atordoamento não desvira: sai um marcador em vez disso; desvirado, nada muda', () => {
    const tg = setup({
      battlefield: [[{ name: 'Wall of Omens', tapped: true, counters: { stun: 2 } }, { name: 'Indomitable Ancients', counters: { stun: 1 } }], []],
      library: [['Plains', 'Plains', 'Plains'], ['Island', 'Island', 'Island']],
    });
    const w = tg.bf('Wall of Omens');
    const a = tg.bf('Indomitable Ancients');
    // desvirar por efeito
    expect(untap(tg.g, w)).toBe(false);
    tg.refresh();
    expect(tg.state.objects[w].tapped).toBe(true);
    expect(tg.state.objects[w].counters.stun).toBe(1);
    // etapa de desvirar (CR 502.3)
    tg.passTo('upkeep', 0);
    expect(tg.state.objects[w].tapped).toBe(true);
    expect(tg.state.objects[w].counters.stun ?? 0).toBe(0);
    expect(tg.state.objects[a].counters.stun).toBe(1); // desvirada: não "desviraria", o marcador fica
    tg.passTo('main1', 1).passTo('upkeep', 0);
    expect(tg.state.objects[w].tapped).toBe(false);
  });
});

describe('proteção contra tipo de carta e de jogador (CR 702.16)', () => {
  it('CR 702.16a: a qualidade tipo de carta vale para fontes com esse tipo', () => {
    const tg = setup({ battlefield: [[], []] });
    expect(protectionMatches(tg.g, 'type:Instant', { colors: ['R'], types: ['Kindred', 'Instant'] })).toBe(true);
    expect(protectionMatches(tg.g, 'type:Instant', { colors: ['R'], types: ['Sorcery'] })).toBe(false);
  });

  it('CR 702.16b: permanente com proteção contra instantâneas não é alvo de instantânea', () => {
    const tg = setup({ battlefield: [['Wall of Omens', 'Island', 'Mountain', 'Mountain'], ['Elvish Mystic']], hand: [['Prismari Command'], []] });
    efeito(tg, tg.bf('Wall of Omens'), [{ k: 'addKeyword', kw: 'protection', param: 'type:Instant' }]);
    let ofertas: string[] = [];
    tg.choose('modo', ['Causa 2 de dano a qualquer alvo', 'O jogador alvo cria uma ficha de Tesouro']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('qualquer alvo') ? (ofertas = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic')!.id] }) : null));
    tg.choose('jogador alvo que cria', ['Ana']);
    tg.cast('Prismari Command').resolve();
    expect(ofertas.sort()).toEqual(['Ana', 'Bruno', 'Elvish Mystic']);
  });

  it('CR 702.16b, 702.16e: jogador com proteção não é alvo e não sofre dano de fontes com a qualidade', () => {
    const tg = setup({ battlefield: [['Island', 'Mountain', 'Mountain'], ['Goldspan Dragon']], hand: [['Prismari Command'], []], library: [['Plains'], ['Island']] });
    regra(tg, 'teste:protInstantanea', 1);
    regra(tg, 'teste:protCriatura', 0);
    let ofertas: string[] = [];
    tg.choose('modo', ['Causa 2 de dano a qualquer alvo', 'O jogador alvo cria uma ficha de Tesouro']);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('qualquer alvo') ? (ofertas = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Goldspan Dragon')!.id] }) : null));
    tg.choose('jogador alvo que cria', ['Ana']);
    tg.cast('Prismari Command').resolve();
    expect(ofertas.sort()).toEqual(['Ana', 'Goldspan Dragon']);
    // dano de combate do dragão de Bruno em Ana (proteção contra criaturas) é prevenido
    tg.passTo('main1', 1);
    tg.attack([['Goldspan Dragon', 0]]).passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
  });

  it('CR 702.16d: Equipamento com a qualidade não equipa e solta de quem ganha proteção', () => {
    const tg = setup({ battlefield: [['Wall of Omens', 'Indomitable Ancients', { name: 'Lightning Greaves', attachTo: 'Wall of Omens' }], []] });
    const botas = tg.bf('Lightning Greaves');
    const anc = tg.bf('Indomitable Ancients');
    efeito(tg, anc, [{ k: 'addKeyword', kw: 'protection', param: 'type:Artifact' }]);
    expect(attach(tg.g, botas, anc)).toBe(false);
    efeito(tg, tg.bf('Wall of Omens'), [{ k: 'addKeyword', kw: 'protection', param: 'type:Artifact' }]);
    expect(tg.state.objects[botas].attachedTo).toBeNull();
    expect(tg.find('Lightning Greaves')).not.toBeNull();
    expect(kwParams(tg.g, tg.bf('Wall of Omens'), 'protection')).toEqual(['type:Artifact']);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'shroud')).toBe(false);
  });
});

describe('mana não gasta (CR 106.4, 500.5)', () => {
  it('sem efeito, a reserva esvazia no fim da etapa', () => {
    const tg = setup({ battlefield: [[], []] });
    addMana(tg.g, 0, ['G']);
    tg.refresh();
    tg.passTo('beginCombat');
    expect(tg.state.players[0].manaPool).toEqual([]);
  });

  it('"se você fosse perder mana não gasta, ela se torna incolor": fica como {C}, também a de "até o fim do turno"', () => {
    const tg = setup({ battlefield: [[], []], library: [['Plains'], ['Island']] });
    regra(tg, 'teste:manaIncolor');
    addMana(tg.g, 0, ['G']);
    addMana(tg.g, 0, ['R'], { source: null, untilEndOfTurn: true });
    addMana(tg.g, 1, ['U']);
    tg.refresh();
    tg.passTo('beginCombat');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['C', 'R']);
    expect(tg.state.players[1].manaPool).toEqual([]); // só o jogador do efeito
    tg.passTo('main1', 1);
    // na limpeza a de "até o fim do turno" se perderia: vira {C} e deixa de ser especial
    expect(tg.state.players[0].manaPool).toEqual([{ type: 'C', source: null }, { type: 'C', source: null }]);
  });
});

describe('monarca que sai da partida (CR 725.4)', () => {
  it('sai no turno de outro: o jogador ativo passa a ser o monarca', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []] });
    tg.state.monarch = 1;
    tg.game.concede(1);
    expect(tg.state.monarch).toBe(0);
  });

  it('o monarca é o ativo e sai: o próximo na ordem de turno', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []] });
    tg.state.monarch = 0;
    tg.game.concede(0);
    expect(tg.state.monarch).toBe(1);
  });

  it('o monarca perde pelo dano de combate: o ativo, dono do atacante, fica monarca', () => {
    const tg = setup({ players: 3, battlefield: [['Indomitable Ancients'], [], []], library: [['Plains'], ['Island'], ['Island']] });
    tg.state.monarch = 1;
    tg.state.players[1].life = 2;
    tg.g.bump();
    tg.refresh();
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2');
    expect(tg.state.players[1].lost).toBe(true);
    expect(tg.state.monarch).toBe(0);
  });
});
