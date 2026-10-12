import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Skorpekh Destroyer';

describe(N, () => {
  it('toque mortífero; ganha iniciativa até o fim do turno quando um artefato seu entra', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Silver Myr'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 2]);
    expect(hasKw(tg.g, id, 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, id, 'first strike')).toBe(false);
    tg.cast('Silver Myr').resolveAll();
    expect(hasKw(tg.g, id, 'first strike')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, id, 'first strike')).toBe(false);
  });
});