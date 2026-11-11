import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Darksteel Plate';

describe(N, () => {
  it('é indestrutível e, equipada por {2}, dá indestrutível à criatura', () => {
    const tg = setup({ battlefield: [[N, 'Wall of Omens', 'Plains', 'Plains'], []] });
    expect(hasKw(tg.g, tg.bf(N), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
    tg.choose('criatura alvo', ['Wall of Omens']).activate(N, 'Equipar').resolveAll();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(true);
  });
});
