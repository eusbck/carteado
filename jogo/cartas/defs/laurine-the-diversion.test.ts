import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Laurine, the Diversion';

describe(N, () => {
  it('iniciativa; {2}, sacrificar um artefato ou criatura: goada a criatura alvo', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring', 'Mountain', 'Mountain'], ['Indomitable Ancients']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'first strike')).toBe(true);
    tg.choose('Sacrifique', ['Sol Ring']).choose('criatura alvo', ['Indomitable Ancients']);
    tg.activate(N, 'Goade').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
  });
});
