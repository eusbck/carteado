import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Nature's Rhythm";

describe(N, () => {
  it('com X = 3, coloca no campo uma criatura de valor 3 ou menos', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Forest')], []], hand: [[N], []], library: [['Elvish Archdruid', 'Woodland Bellower'], []] });
    tg.number('X', 3).choose('procure uma carta de criatura', ['Elvish Archdruid']).cast(N).resolve();
    expect(tg.find('Elvish Archdruid')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('harmonizar: do cemitério, virando uma criatura para reduzir o genérico, e vai para o exílio', () => {
    const tg = setup({
      battlefield: [[...Array(4).fill('Forest'), 'Indomitable Ancients'], []],
      graveyard: [[N], []],
      library: [['Llanowar Elves'], []],
    });
    tg.number('X', 2).choose('Harmonizar', ['Indomitable Ancients (força 2)']).choose('procure uma carta de criatura', ['Llanowar Elves']);
    tg.cast(N, 'harmonize').resolve();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
    expect(tg.names(0, 'exile')).toEqual([N]);
  });
});
