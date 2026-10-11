import { describe, expect, it } from 'vitest';
import { hasKw, kwParams } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Malakir Bloodwitch';

describe(N, () => {
  it('voar e proteção contra o branco; ao entrar, cada oponente perde vida igual aos seus Vampires e você ganha o total', () => {
    const tg = setup({ players: 3, battlefield: [['Vampire Nighthawk'], [], []] });
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(kwParams(tg.g, id, 'protection')).toContain('color:W');
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([44, 38, 38]);
  });
});
