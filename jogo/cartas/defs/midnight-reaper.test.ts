import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Midnight Reaper', () => {
  it('uma criatura não ficha sua morre: 1 de dano em você e você compra', () => {
    const tg = setup({ battlefield: [['Midnight Reaper', 'Wall of Omens'], []], library: [['Island', 'Plains'], []] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('fichas e criaturas dos oponentes não disparam', () => {
    const tg = setup({ battlefield: [['Midnight Reaper', { name: 'Zombie 2/2', token: true }], ['Wall of Omens']], library: [['Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Zombie 2/2'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('CR 603.10a: dispara quando a própria Midnight Reaper morre', () => {
    const tg = setup({ battlefield: [['Midnight Reaper'], []], library: [['Island'], []] });
    tg.run(destroy(tg.g, [tg.bf('Midnight Reaper')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(39);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('CR 603.10a: morrendo junto com outras, dispara por cada uma', () => {
    const tg = setup({ battlefield: [['Midnight Reaper', 'Wall of Omens', 'Elvish Mystic', { name: 'Zombie 2/2', token: true }], []], library: [['Island', 'Plains', 'Forest', 'Swamp'], []] });
    tg.run(destroy(tg.g, [tg.bf('Midnight Reaper'), tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'), tg.bf('Zombie 2/2')]));
    tg.resolveAll();
    expect(tg.life(0)).toBe(37);
    expect(tg.names(0, 'hand').length).toBe(3);
  });
});
