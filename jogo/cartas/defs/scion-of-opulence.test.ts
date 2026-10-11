import { describe, expect, it } from 'vitest';
import { createTokens, destroy } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Scion of Opulence';

describe(N, () => {
  it('cria um Treasure quando ele ou outro Vampire seu que não é ficha morre', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 1]);
    runEffect(tg, createTokens(tg.g, 0, 'Vampire 1/1', 1));
    // a ficha de Vampire e o Elvish Mystic não contam
    tg.run(destroy(tg.g, [tg.bf('Vampire'), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    tg.run(destroy(tg.g, [tg.bf('Vampire Nighthawk'), tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Treasure')).toHaveLength(2);
  });

  it('{R}, sacrificar dois artefatos: exila o topo do grimório, que pode ser jogado neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Mountain', 'Mountain'], []], library: [['Sol Ring', 'Swamp', 'Swamp', 'Swamp'], Array(4).fill('Swamp')] });
    runEffect(tg, createTokens(tg.g, 0, 'Treasure', 2));
    tg.activate(N, 'Sacrifique dois artefatos').resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});
