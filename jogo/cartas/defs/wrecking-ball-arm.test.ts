import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Wrecking Ball Arm';

describe(C, () => {
  it('equipar criatura lendária {3}: base 7/7', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', C, 'Dina, Essence Brewer'], []] });
    tg.activate(C, 'Equipar criatura lendária').resolve();
    expect(tg.pt(tg.bf('Dina, Essence Brewer'))).toEqual([7, 7]);
  });
  it('a criatura comum só com Equipar {7}', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', C, 'Elvish Mystic'], []] });
    expect(tg.actionIds().some((a) => a.includes('activate') && a.includes(String(tg.bf(C))))).toBe(false);
  });
  it('ruling 2: +1/+1 e marcadores valem por cima do 7/7', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', counters: { '+1/+1': 2 } }], []] });
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([9, 9]);
  });
  it('não pode ser bloqueada por criaturas com força 2 ou menos', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], ['Wall of Omens', "Archon of Sun's Grace"]] });
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(false);
    expect(canBlock(tg.g, tg.bf("Archon of Sun's Grace"), tg.bf('Elvish Mystic'))).toBe(true);
  });
});
