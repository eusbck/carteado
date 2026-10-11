import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bloodsworn Steward';

describe(N, () => {
  it('voar; as criaturas comandantes que você controla recebem +2/+2 e têm ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Silver Myr'], ['Elvish Mystic']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    const elfo = tg.bf('Elvish Mystic', 0);
    tg.state.cards[tg.state.objects[elfo].card!].isCommander = true;
    const dele = tg.bf('Elvish Mystic', 1);
    tg.state.cards[tg.state.objects[dele].card!].isCommander = true;
    tg.refresh();
    expect(tg.pt(elfo)).toEqual([3, 3]);
    expect(hasKw(tg.g, elfo, 'haste')).toBe(true);
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    expect(tg.pt(dele)).toEqual([1, 1]);
  });
});
