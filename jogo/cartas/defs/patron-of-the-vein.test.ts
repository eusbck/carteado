import { describe, expect, it } from 'vitest';
import { createTokens, destroy } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Patron of the Vein';

describe(N, () => {
  it('ao entrar, destrói a criatura alvo de um oponente; ela é exilada e cada Vampire seu ganha um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Vampire Nighthawk', 'Elvish Mystic'], ['Indomitable Ancients']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([3, 4]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });

  it('quando morre uma ficha do oponente, os marcadores vêm mesmo sem carta para exilar', () => {
    const tg = setup({ battlefield: [[N], []] });
    runEffect(tg, createTokens(tg.g, 1, 'Cat', 1));
    tg.run(destroy(tg.g, [tg.bf('Cat')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });
});
