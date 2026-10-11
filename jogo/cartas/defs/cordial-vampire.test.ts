import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cordial Vampire';

describe(N, () => {
  it('duas criaturas morrendo juntas dão dois marcadores a cada Vampire seu', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic'], ['Silver Myr', 'Vampire Nighthawk']] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Silver Myr')]));
    tg.resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 0))).toEqual([4, 5]);
    expect(tg.pt(tg.bf('Vampire Nighthawk', 1))).toEqual([2, 3]);
  });
});
