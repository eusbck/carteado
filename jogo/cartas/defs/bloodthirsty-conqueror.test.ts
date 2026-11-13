import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Bloodthirsty Conqueror', () => {
  it('dano a um oponente faz você ganhar essa quantidade de vida', () => {
    const tg = setup({ battlefield: [['Bloodthirsty Conqueror'], []] });
    const src = tg.bf('Bloodthirsty Conqueror');
    dealDamage(tg.g, [{ source: src, target: { kind: 'player', id: 1 }, amount: 3, combat: false }]);
    tg.refresh();
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
  });
});
