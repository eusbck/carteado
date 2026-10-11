import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Molten Echoes';
const lib = Array(10).fill('Swamp');

describe(N, () => {
  it('a criatura do tipo escolhido que entra ganha uma cópia com ímpeto, exilada na etapa final; as habilidades de entrar da cópia disparam', () => {
    // Champion of Dusk (Vampire Knight): a original e a cópia disparam ao entrar
    const tg = setup({ battlefield: [[...Array(4).fill('Mountain'), ...Array(5).fill('Swamp')], []], hand: [[N, 'Champion of Dusk', 'Elvish Mystic'], []], library: [lib, lib] });
    tg.choose('tipo de criatura', ['Vampire']).cast(N).resolveAll();
    tg.cast('Champion of Dusk').resolveAll();
    const copias = tg.all('Champion of Dusk');
    expect(copias).toHaveLength(2);
    const ficha = copias.find((id) => tg.state.objects[id].isToken)!;
    expect(hasKw(tg.g, ficha, 'haste')).toBe(true);
    // a original vê 1 Vampire e a cópia vê 2 (ou o contrário): 3 cartas e 3 de vida
    expect(tg.life(0)).toBe(37);
    tg.passTo('main1', 1);
    expect(tg.all('Champion of Dusk')).toHaveLength(1);
  });

  it('criatura de outro tipo e ficha não ganham cópia', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [lib, lib] });
    tg.state.objects[tg.bf(N)].choices.creatureType = 'Vampire';
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Elvish Mystic')).toHaveLength(1);
  });
});
