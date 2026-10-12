import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Patriot, Shield Wielder';

describe(N, () => {
  it('{2}, {T}: outra criatura sua recebe +2/+0 e resistência a magia até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Wall of Omens'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.choose('outra criatura alvo que você controla', ['Wall of Omens']).activate(N).resolveAll();
    const muro = tg.bf('Wall of Omens');
    expect(tg.pt(muro)).toEqual([2, 4]);
    expect(hasKw(tg.g, muro, 'hexproof')).toBe(true);
    tg.passTo('upkeep', 1);
    expect(tg.pt(muro)).toEqual([0, 4]);
  });
});