import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/actions.ts';
import { setup } from '../../testes/harness.ts';

describe('Gyre Sage', () => {
  it('evolui com uma criatura maior e gera {G} por marcador', () => {
    const tg = setup({ battlefield: [['Gyre Sage'], []], hand: [['Indomitable Ancients'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    const sabio = tg.bf('Gyre Sage');
    expect(tg.state.objects[sabio].counters['+1/+1']).toBe(1);
    const act = tg.actionIds().find((a) => a.startsWith('mana:') && a.includes(String(sabio)))!;
    tg.answer({ kind: 'priority', action: act });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
  });
});
