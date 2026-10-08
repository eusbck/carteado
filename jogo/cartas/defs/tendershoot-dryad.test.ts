import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Tendershoot Dryad', () => {
  it('Saproling em cada manutenção; a bênção chega sem usar a pilha e fica mesmo com menos de dez permanentes', () => {
    const tg = setup({
      step: 'end', active: 1, battlefield: [['Tendershoot Dryad', ...Array(7).fill('Forest')], []], library: [['Island', 'Island'], ['Island', 'Island']],
    });
    // 8 permanentes; a Saproling da manutenção faz 9: ainda sem bênção
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.state.players[0].citysBlessing).toBe(false);
    tg.passTo('main1').play('Island'); // a Island veio na compra; com ela, dez permanentes
    expect(tg.state.players[0].citysBlessing).toBe(true);
    expect(tg.pt(tg.bf('Saproling'))).toEqual([3, 3]);
    tg.run(destroy(tg.g, tg.all('Forest')));
    tg.refresh();
    expect(tg.state.players[0].citysBlessing).toBe(true);
    expect(tg.pt(tg.bf('Saproling'))).toEqual([3, 3]);
  });
});
