import { describe, expect, it } from 'vitest';
import { createTokens, destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shelob, Dread Weaver';
const lib = Array(10).fill('Swamp');

describe(N, () => {
  it('exila a criatura não ficha de um oponente que morre; {2}{B} troca uma carta exilada por dois marcadores e uma compra', () => {
    const tg = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp', 'Elvish Mystic'], ['Elvish Mystic', 'Silver Myr']], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(() => tg.activate(N, '{2}{B}, Coloque')).toThrow();
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic', 1), tg.bf('Elvish Mystic', 0)]));
    tg.resolveAll();
    // só a do oponente é exilada
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'graveyard')).toEqual(['Elvish Mystic']);
    tg.activate(N, '{2}{B}, Coloque').resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Elvish Mystic']);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('{X}{1}{B}: põe no campo, virada e sob o seu controle, a carta exilada com valor de mana X; ficha não é exilada', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Swamp')], ['Silver Myr']], library: [lib, lib] });
    tg.run(createTokens(tg.g, 1, 'Cat', 1));
    tg.run(destroy(tg.g, [tg.bf('Silver Myr'), tg.bf('Cat')]));
    tg.resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Silver Myr']);
    // Silver Myr tem valor de mana 2: X = 2, total {2}{1}{B}
    tg.number('valor de X', 2).choose('carta de criatura alvo', ['Silver Myr']);
    tg.activate(N, '{X}{1}{B}').resolveAll();
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[myr].controller).toBe(0);
    expect(tg.state.objects[myr].tapped).toBe(true);
  });
});
