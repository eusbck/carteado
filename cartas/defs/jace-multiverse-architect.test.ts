import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { attackCandidates } from '../../motor/combat.ts';
import type { Decision } from '../../motor/types.ts';

const JACE = 'Jace, Multiverse Architect';
const TERRENOS = (n: number) => ['Plains', 'Island', 'Swamp', 'Mountain', ...Array(n - 4).fill('Plains')];

describe('Jace, Multiverse Architect', () => {
  it('é comandante: conjurado da zona de comando (CR 903.8, com imposto), entra com 4 de lealdade', () => {
    const tg = setup({ battlefield: [TERRENOS(11), []], command: [[JACE], []] });
    tg.cast(JACE, 'command').resolve();
    const j = tg.bf(JACE);
    expect(tg.state.objects[j].counters.loyalty).toBe(4);
    const cid = tg.state.objects[j].card!;
    expect(tg.state.players[0].commanderCasts[String(cid)]).toBe(1);
    // sem lealdade vai para o cemitério (CR 704.5i) e o dono o devolve à zona de comando (CR 903.9a)
    tg.state.objects[j].counters.loyalty = 0;
    tg.g.bump();
    tg.yes('zona de comando');
    tg.refresh().settle();
    expect(tg.find(JACE, 'command')).not.toBeNull();
    // agora custa {1}{W}{U}{B}{R} + {2}: com 6 terrenos desvirados não dá
    expect(tg.canCast(JACE)).toBe(false);
    for (const id of tg.state.zones.battlefield) tg.state.objects[id].tapped = false;
    tg.g.bump();
    tg.refresh();
    tg.cast(JACE, 'command').resolve();
    expect(tg.find(JACE)).not.toBeNull();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(7);
  });

  it('+1: compra duas cartas e põe uma carta da mão no fundo do grimório; uma habilidade de lealdade por turno (CR 606.3)', () => {
    const tg = setup({ battlefield: [[JACE], []], hand: [['Sol Ring'], []], library: [['Plains', 'Island', 'Swamp'], []] });
    tg.choose('fundo do grimório', ['Sol Ring']);
    tg.activate(JACE, '+1').resolve();
    const j = tg.bf(JACE);
    expect(tg.state.objects[j].counters.loyalty).toBe(5);
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Sol Ring']);
    expect(tg.actionIds().some((a) => a.startsWith(`act:${j}:`))).toBe(false);
  });

  it('−3: exila outro permanente seu (criatura ou planeswalker) e revela até uma criatura ou planeswalker, que entra; o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [[JACE, 'Wall of Omens', 'Sol Ring'], ['Indomitable Ancients']],
      library: [['Plains', 'Sol Ring', 'Zetalpa, Primal Dawn', 'Island'], []],
    });
    let opcoes: string[] = [];
    tg.script.push((d: Decision) => {
      if (d.kind !== 'select' || !d.prompt.includes('outro planeswalker ou criatura')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Wall of Omens')!.id] };
    });
    tg.activate(JACE, '−3').resolve();
    tg.resolveAll();
    // só os seus, e não o próprio Jace nem o artefato
    expect(opcoes).toEqual(['Wall of Omens']);
    expect(tg.state.objects[tg.bf(JACE)].counters.loyalty).toBe(1);
    expect(tg.names(0, 'exile')).toEqual(['Wall of Omens']);
    expect(tg.find('Zetalpa, Primal Dawn', 'battlefield', 0)).not.toBeNull();
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Island');
    expect(lib.slice(1).sort()).toEqual(['Plains', 'Sol Ring']);
  });

  it('no combate de um oponente, se ele não pagar {2}, as criaturas dele não podem atacar Jaces seus neste turno', () => {
    const tg = setup({ active: 1, battlefield: [[JACE], ['Indomitable Ancients', 'Island', 'Island']], library: [['Plains'], ['Plains']] });
    tg.yes('Pagar {2}', false);
    tg.passTo('beginCombat');
    const j = tg.bf(JACE);
    const anc = tg.bf('Indomitable Ancients');
    const alvos = attackCandidates(tg.g, 1).find((x) => x.obj === anc)!.targets;
    expect(alvos).toEqual([{ kind: 'player', id: 0 }]);
    expect(alvos.some((a) => a.kind === 'obj' && a.id === j)).toBe(false);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(0);
    const restricao = () => tg.state.effects.some((e) => e.mods.some((m) => m.k === 'rule' && m.id.includes('naoAtacaJaces')));
    expect(restricao()).toBe(true);
    // vale só neste turno
    tg.passTo('main1', 0);
    expect(restricao()).toBe(false);
  });

  it('se o oponente pagar {2}, as criaturas dele podem atacar Jace', () => {
    const tg = setup({ active: 1, battlefield: [[JACE], ['Indomitable Ancients', 'Island', 'Island']] });
    tg.yes('Pagar {2}', true);
    tg.passTo('beginCombat');
    const j = tg.bf(JACE);
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
    tg.attack([[anc, { kind: 'obj', id: j }]]).passTo('combatDamage');
    expect(tg.state.objects[j].counters.loyalty).toBe(2);
  });

  it('não dispara no seu próprio turno', () => {
    const tg = setup({ battlefield: [[JACE, 'Indomitable Ancients'], ['Island', 'Island']] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('Pagar {2}')) throw new Error('não deveria perguntar'); return null; });
    tg.passTo('beginCombat');
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.state.effects.length).toBe(0);
  });
});
