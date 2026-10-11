import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Nova Flame';

describe(N, () => {
  it('põe X marcadores +1/+1 na sua criatura alvo e ela causa dano igual ao poder a cada outra criatura', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Mountain'), 'Elvish Mystic', 'Silver Myr'], ['Indomitable Ancients']], hand: [[N], []] });
    const elfo = tg.bf('Elvish Mystic');
    const anciao = tg.bf('Indomitable Ancients');
    tg.number('valor de X', 2).choose('criatura alvo', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.pt(elfo)).toEqual([3, 3]);
    expect(tg.state.objects[elfo].damage).toBe(0);
    // a sua outra criatura também toma o dano
    expect(tg.find('Silver Myr')).toBeNull();
    expect(tg.state.objects[anciao].damage).toBe(3);
  });
});
