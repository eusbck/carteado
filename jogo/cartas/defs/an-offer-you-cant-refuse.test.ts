import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = "An Offer You Can't Refuse";

describe(C, () => {
  it('anula a mágica e o controlador dela cria dois Treasures', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[C, 'Opt'], []], library: [['Opt'], []] });
    tg.cast('Opt');
    tg.choose('mágica alvo', ['Opt']).cast(C).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(expect.arrayContaining(['Opt', C]));
    expect(tg.all('Treasure').length).toBe(2);
  });
});
