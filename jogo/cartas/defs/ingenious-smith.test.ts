import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ingenious Smith';

describe(N, () => {
  it('entrando, olha as quatro do topo e pode pôr um artefato na mão; o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Forest', 'Sol Ring', 'Island', 'Swamp', 'Mountain'], []] });
    tg.choose('Ingenious Smith', ['Sol Ring']);
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')[0]).toBe('Mountain');
    expect(tg.names(0, 'library')).toHaveLength(4);
  });

  it('artefatos seus entrando: um marcador +1/+1, só uma vez por turno', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Sol Ring', 0);
    tg.resolveAll();
    enterCard(tg, 'Darksteel Ingot', 0);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    enterCard(tg, 'Thran Dynamo', 1);
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
  });
});