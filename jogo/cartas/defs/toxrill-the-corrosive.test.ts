import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Toxrill, the Corrosive';
const lib = Array(10).fill('Swamp');

describe(N, () => {
  it('na etapa final, cada criatura que você não controla recebe um marcador de gosma e -1/-1; morrendo, você cria um Slug', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Elvish Mystic', 'Indomitable Ancients']], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([7, 7]);
    tg.passTo('upkeep', 1);
    // o Mystic do oponente (1/1) morreu com -1/-1; o Ancients fica 1/9; as suas criaturas não mudam
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([1, 9]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    const [lesma] = tg.all('Slug');
    expect(tg.pt(lesma)).toEqual([1, 1]);
    expect(tg.state.objects[lesma].controller).toBe(0);
  });

  it('{U}{B}, sacrificar um Slug: compra uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Swamp'], ['Elvish Mystic']], library: [lib, lib] });
    tg.passTo('upkeep', 1);
    tg.passTo('main1', 0);
    const antes = tg.names(0, 'hand').length;
    // Toxrill também é um Slug: escolhe a ficha
    tg.choose('Sacrifique', [tg.bf('Slug')]);
    tg.activate(N, 'Sacrifique um Slug').resolveAll();
    expect(tg.all('Slug')).toHaveLength(0);
    expect(tg.find(N)).not.toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(antes + 1);
  });
});
