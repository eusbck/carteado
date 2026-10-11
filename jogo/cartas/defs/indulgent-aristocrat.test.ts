import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Indulgent Aristocrat';

describe(N, () => {
  it('vínculo com a vida; {2}, sacrificar uma criatura: um marcador +1/+1 em cada Vampire seu', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Elvish Mystic', 'Swamp', 'Swamp'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 1]);
    expect(hasKw(tg.g, id, 'lifelink')).toBe(true);
    tg.choose('Sacrifique', ['Elvish Mystic']).activate(N, '{2}, Sacrifique').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([3, 4]);
  });

  it('sacrificando a si mesmo, os outros Vampires ainda recebem o marcador', () => {
    const tg = setup({ battlefield: [[N, 'Vampire Nighthawk', 'Swamp', 'Swamp'], []] });
    tg.choose('Sacrifique', [N]).activate(N, '{2}, Sacrifique').resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([3, 4]);
  });
});
