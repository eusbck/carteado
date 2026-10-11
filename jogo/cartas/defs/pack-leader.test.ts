import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Pack Leader';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('os outros Dogs seus recebem +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Loyal Warhound', 'Elvish Mystic'], ['Loyal Warhound']], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Loyal Warhound', 0))).toEqual([4, 2]);
    expect(tg.pt(tg.bf('Loyal Warhound', 1))).toEqual([3, 1]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
  });

  it('ao atacar, o dano de combate aos seus Dogs é prevenido, mesmo que Pack Leader saia do campo', () => {
    const tg = setup({ battlefield: [[N, 'Loyal Warhound', 'Elvish Mystic'], ['Indomitable Ancients', 'Keeper of Fables', 'Silver Myr']], library: [lib, lib] });
    const cao = tg.bf('Loyal Warhound');
    tg.attack([[N, 1], ['Loyal Warhound', 1], ['Elvish Mystic', 1]]);
    tg.block([['Indomitable Ancients', 'Loyal Warhound'], ['Silver Myr', 'Elvish Mystic']]);
    tg.passTo('declareBlockers');
    tg.run(exile(tg.g, [tg.bf(N)]));
    tg.passTo('main2', 0);
    // o Dog bloqueado por um 2/10 sobrevive sem dano; o Elvish Mystic (não é Dog) troca com o Myr
    expect(tg.state.objects[cao].zone).toBe('battlefield');
    expect(tg.state.objects[cao].damage).toBe(0);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
