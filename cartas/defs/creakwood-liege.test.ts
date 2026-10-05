import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Creakwood Liege', () => {
  it('o Worm preto e verde recebe +2/+2', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Creakwood Liege', 'Elvish Mystic'], []], library: [['Island'], ['Island']] });
    tg.yes('Worm', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.pt(tg.bf('Worm'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Creakwood Liege'))).toEqual([2, 2]);
  });
});
