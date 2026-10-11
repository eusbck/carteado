import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rapid Hybridization';

describe(N, () => {
  it('destrói a criatura alvo e o controlador dela cria um Frog Lizard 3/3 verde', () => {
    const tg = setup({ battlefield: [['Island'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    const ficha = tg.bf('Frog Lizard');
    expect(tg.state.objects[ficha].controller).toBe(1);
    expect(tg.pt(ficha)).toEqual([3, 3]);
  });

  it('o controlador cria o Frog Lizard mesmo que a criatura seja indestrutível', () => {
    const tg = setup({ battlefield: [['Island'], ['Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.all('Frog Lizard')).toHaveLength(1);
  });
});
