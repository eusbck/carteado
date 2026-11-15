import { describe, expect, it } from 'vitest';
import { addEffect, putOntoBattlefield, returnToHand } from '../../motor/api.ts';
import { enterCard, fixture, runEffect } from '../../testes/artefatos.ts';

const N = "Sazh's Chocobo";

describe(N, () => {
  it('é uma Ave 0/1 e recebe marcadores permanentes', () => {
    const tg = fixture({ battlefield: [['Forest'], []], hand: [[N, 'Plains'], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([0, 1]);
    tg.play('Plains').resolveAll().passTo('upkeep', 1);
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
  });

  it('recebe um marcador por terreno jogado ou colocado no campo por um efeito, apenas sob seu controle', () => {
    const tg = fixture({ battlefield: [[N], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    enterCard(tg, 'Plains', 0);
    tg.resolveAll();
    enterCard(tg, 'Island', 1);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
  });

  it('cada terreno que entra no mesmo lote dispara uma vez', () => {
    const tg = fixture({ battlefield: [[N], []], hand: [['Forest', 'Plains'], []] });
    runEffect(tg, putOntoBattlefield(tg.g, [
      { id: tg.find('Forest', 'hand')!, controller: 0 },
      { id: tg.find('Plains', 'hand')!, controller: 0 },
    ], 'effect'));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
  });

  it('tornar uma permanente em terreno não dispara aterragem', () => {
    const tg = fixture({ battlefield: [[N, 'Indomitable Ancients'], []] });
    addEffect(tg.g, { source: tg.bf(N), sourceDef: N, controller: 0, duration: { kind: 'endOfTurn' }, affected: [tg.bf('Indomitable Ancients')], mods: [{ k: 'addTypes', types: ['Land'] }] });
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([0, 1]);
    expect(tg.state.zones.stack).toHaveLength(0);
  });

  it('CR 400.7: o gatilho antigo não coloca marcadores na criatura que voltou ao campo', () => {
    const tg = fixture({ battlefield: [[N, 'Forest'], []], hand: [['Plains'], []] });
    tg.play('Plains');
    runEffect(tg, returnToHand(tg.g, [tg.bf(N)]));
    runEffect(tg, putOntoBattlefield(tg.g, [{ id: tg.find(N, 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([0, 1]);
  });
});
