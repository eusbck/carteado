import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const C = "Trailblazer's Boots";

describe(C, () => {
  it('CR 702.14c: não pode ser bloqueada se o defensor controla terreno não básico', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], ['Command Tower', 'Wall of Omens']] });
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(false);
    const tg2 = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, 'Elvish Mystic'], ['Forest', 'Wall of Omens']] });
    expect(canBlock(tg2.g, tg2.bf('Wall of Omens'), tg2.bf('Elvish Mystic'))).toBe(true);
  });
  it('sem a bota, a criatura pode ser bloqueada', () => {
    const tg = setup({ battlefield: [[C, 'Elvish Mystic'], ['Command Tower', 'Wall of Omens']] });
    expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(true);
  });
});
