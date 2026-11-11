import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

const N = 'U.S.S. Farragut, Bold Explorer';

describe(N, () => {
  it('jogando um terreno, põe uma criatura da mão com ímpeto; na etapa final ela vai para o fundo e você compra', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Forest', 'Elder Gargaroth'], []], library: [['Island', 'Plains'], []] });
    tg.choose('U.S.S. Farragut', ['Elder Gargaroth']);
    tg.play('Forest').resolveAll();
    const g = tg.bf('Elder Gargaroth');
    expect(hasKw(tg.g, g, 'haste')).toBe(true);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Elder Gargaroth', 'battlefield')).toBeNull();
    expect(tg.names(0, 'library').at(-1)).toBe('Elder Gargaroth');
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('com 7+ marcadores de carga, é criatura 4/4 com voar', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 7 } }], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
