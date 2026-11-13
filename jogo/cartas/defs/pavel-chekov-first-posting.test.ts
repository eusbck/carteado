import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { draw } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';

const N = 'Pavel Chekov, First Posting';

describe(N, () => {
  it('em vez de comprar, revela até um terreno: o terreno vai para a mão e as outras para o fundo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Wall of Omens', 'Forest', 'Island'], []] });
    tg.yes('Pavel Chekov', true).choose('Pavel Chekov: escolha', ['Terreno']);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'library')[0]).toBe('Island');
    expect(tg.names(0, 'library').slice(1).sort()).toEqual(['Sol Ring', 'Wall of Omens']);
  });
  it('recusando, compra normalmente', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Sol Ring', 'Forest'], []] });
    tg.yes('Pavel Chekov', false);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.state.turnStats[0].cardsDrawn).toBe(1);
  });
});
