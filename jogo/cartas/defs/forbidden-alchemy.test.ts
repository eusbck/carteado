import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Forbidden Alchemy';

describe(N, () => {
  it('olha as quatro do topo: uma vai para a mão e o resto para o cemitério', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Swamp', 'Sol Ring', 'Island', 'Hex', 'Mountain'], []] });
    tg.choose('Forbidden Alchemy', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Hex', 'Island', 'Swamp'].sort());
    expect(tg.names(0, 'library')).toEqual(['Mountain']);
  });

  it('com menos de quatro cartas no grimório, olha todas', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Swamp', 'Sol Ring'], []] });
    tg.choose('Forbidden Alchemy', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')).toEqual([]);
  });

  it('conjurada pela retrospectiva, é exilada', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Island'), 'Swamp'], []], graveyard: [[N], []], library: [['Sol Ring', 'Swamp'], []] });
    tg.choose('Forbidden Alchemy', ['Sol Ring']).cast(N, 'flashback').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
});
