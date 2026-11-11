import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'The Borg Queen';

describe(C, () => {
  it('ao entrar, o oponente exila até uma criatura; ela é assimilada e o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Plains'), ...Array(2).fill('Island'), ...Array(2).fill('Swamp')], []], hand: [[C], []], library: [['Opt'], ['Opt', 'Forest', 'Elvish Mystic', 'Island']] });
    tg.cast(C).resolve().resolveAll();
    const elfo = tg.bf('Elvish Mystic', 0);
    expect(chars(tg.g, elfo).subtypes).toEqual(['Borg']);
    // marcador +1/+1 e +2/+2 da Rainha
    expect(tg.pt(elfo)).toEqual([4, 4]);
    const lib = tg.state.zones.library[1].map((id) => tg.state.objects[id].def);
    expect(lib[0]).toBe('Island');
    expect(lib.slice(1).sort()).toEqual(['Forest', 'Opt']);
  });
});
