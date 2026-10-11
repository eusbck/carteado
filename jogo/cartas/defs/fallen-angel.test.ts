import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fallen Angel';

describe(N, () => {
  it('voar; sacrificando uma criatura, recebe +2/+1 até o fim do turno', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('Sacrifique', ['Silver Myr']).activate(N).resolveAll();
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.pt(id)).toEqual([5, 4]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(id)).toEqual([3, 3]);
  });

  it('pode sacrificar a si mesma', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.activate(N).resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});