import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Undead Augur', () => {
  it('outro Zombie seu morre (ficha também): compra e perde 1', () => {
    const tg = setup({ battlefield: [['Undead Augur', { name: 'Zombie 2/2', token: true }], []], library: [['Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Zombie 2/2')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(39);
  });
  it('não Zombies e Zombies dos oponentes não disparam', () => {
    const tg = setup({ battlefield: [['Undead Augur', 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }]], library: [['Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens'), tg.bf('Zombie 2/2')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 603.10a: morrendo junto com outros Zombies, dispara por cada um', () => {
    const tg = setup({ battlefield: [['Undead Augur', { name: 'Zombie 2/2', token: true }, "Stitcher's Supplier"], []], library: [['Island', 'Plains', 'Forest', 'Swamp', 'Mountain', 'Island', 'Plains'], []] });
    tg.run(destroy(tg.g, [tg.bf('Undead Augur'), tg.bf('Zombie 2/2'), tg.bf("Stitcher's Supplier")]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(37);
    expect(tg.names(0, 'hand').length).toBe(3);
  });
});
