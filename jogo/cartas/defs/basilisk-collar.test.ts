import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Basilisk Collar';

describe(C, () => {
  it('equipar {2}: a criatura equipada tem toque mortífero e vínculo com a vida', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', C, 'Wall of Omens'], []] });
    tg.activate(C, 'Equipar').resolve();
    const wall = tg.bf('Wall of Omens');
    expect(tg.state.objects[tg.bf(C)].attachedTo).toBe(wall);
    expect(hasKw(tg.g, wall, 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, wall, 'lifelink')).toBe(true);
  });
  it('CR 702.2b e 702.15b: 1 de dano destrói a criatura e o controlador ganha a vida', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], ['Indomitable Ancients']] });
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'obj', id: tg.bf('Indomitable Ancients') }, amount: 1, combat: false }]);
    tg.refresh().settle();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(41);
  });
});
