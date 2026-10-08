import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, putOntoBattlefield } from '../../motor/api.ts';

describe('Gorma, the Gullet', () => {
  it('cresce quando outra criatura sua morre; criaturas entram com marcadores pelas mortes do turno', () => {
    const tg = setup({ battlefield: [['Gorma, the Gullet', 'Elvish Mystic', 'Elvish Mystic'], []], hand: [['Wall of Omens'], []], library: [['Island', 'Island'], []] });
    tg.run(destroy(tg.g, tg.all('Elvish Mystic')));
    tg.resolveAll();
    expect(tg.pt(tg.bf('Gorma, the Gullet'))).toEqual([3, 3]);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.state.zones.hand[0][0], controller: 0 }], 'effect'));
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1']).toBe(2);
  });
  it('entrando junto com Gorma, não ganha marcadores', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [['Gorma, the Gullet', 'Wall of Omens'], []], library: [['Island', 'Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.run(putOntoBattlefield(tg.g, tg.state.zones.hand[0].map((id) => ({ id, controller: 0 })), 'effect'));
    expect(tg.state.objects[tg.bf('Wall of Omens')].counters['+1/+1'] ?? 0).toBe(0);
  });
});
