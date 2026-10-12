import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Biogenic Ooze';

describe(N, () => {
  it('cria um Ooze 2/2 ao entrar e por {1}{G}{G}{G}; na sua etapa final, um marcador +1/+1 em cada Ooze seu', () => {
    const tg = setup({ battlefield: [Array(9).fill('Forest'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.all('Ooze')).toHaveLength(1);
    expect(tg.pt(tg.all('Ooze')[0])).toEqual([2, 2]);
    tg.activate(N).resolveAll();
    expect(tg.all('Ooze')).toHaveLength(2);
    tg.passTo('upkeep', 1);
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    for (const id of tg.all('Ooze')) expect(tg.pt(id)).toEqual([3, 3]);
  });
});