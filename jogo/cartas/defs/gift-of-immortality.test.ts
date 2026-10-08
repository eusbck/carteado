import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy, exile } from '../../motor/api.ts';

describe('Gift of Immortality', () => {
  it('a criatura volta e a Aura volta anexada na etapa final', () => {
    const tg = setup({ battlefield: [['Wall of Omens', { name: 'Gift of Immortality', attachTo: 'Wall of Omens' }], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    const w = tg.bf('Wall of Omens');
    expect(tg.names(0, 'graveyard')).toEqual(['Gift of Immortality']);
    tg.passTo('end').resolve();
    expect(tg.state.objects[tg.bf('Gift of Immortality')].attachedTo).toBe(w);
  });
  it('sem a criatura no campo, a Aura fica no cemitério', () => {
    const tg = setup({ battlefield: [['Wall of Omens', { name: 'Gift of Immortality', attachTo: 'Wall of Omens' }], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    tg.run(exile(tg.g, [tg.bf('Wall of Omens')]));
    tg.passTo('end').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Gift of Immortality']);
  });
  it('ficha não volta, nem a Aura', () => {
    const tg = setup({ battlefield: [[{ name: 'Inkling', token: true }, { name: 'Gift of Immortality', attachTo: 'Inkling' }], []], library: [['Island', 'Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Inkling')]));
    tg.resolveAll();
    expect(tg.find('Inkling')).toBeNull();
    expect(tg.state.delayedTriggers.length).toBe(0);
  });
});
