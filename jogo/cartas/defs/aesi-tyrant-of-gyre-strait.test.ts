import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Aesi, Tyrant of Gyre Strait';

describe(N, () => {
  it('você joga dois terrenos no turno, e cada um pode comprar uma carta', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest', 'Island', 'Swamp'], []], library: [['Hex', 'Hex'], []] });
    tg.yes('Aesi', true).play('Forest').resolveAll();
    tg.yes('Aesi', false).play('Island').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Hex', 'Swamp']);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
});
