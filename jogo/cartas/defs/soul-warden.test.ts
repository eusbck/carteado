import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Soul Warden';

describe(N, () => {
  it('você ganha 1 de vida sempre que outra criatura entra, de qualquer jogador', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    enterCard(tg, 'Silver Myr', 0);
    enterCard(tg, 'Elvish Mystic', 1);
    enterCard(tg, 'Sol Ring', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(42);
  });
});