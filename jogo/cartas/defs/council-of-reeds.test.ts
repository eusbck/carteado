import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Council of Reeds';

describe(N, () => {
  it('cria uma ficha cópia de si mesma, que fica no campo apesar de lendária, e a cópia também dispara no turno seguinte', () => {
    const lib = Array(8).fill('Forest');
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(tg.all(N)).toHaveLength(2);
    expect(tg.all(N).filter((id) => tg.state.objects[id].isToken)).toHaveLength(1);
    // no turno seguinte, as duas disparam
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(tg.all(N)).toHaveLength(4);
  });

  it('a regra das lendas continua valendo para os oponentes', () => {
    const tg = setup({ battlefield: [[N], ['Zetalpa, Primal Dawn', 'Zetalpa, Primal Dawn']] });
    tg.choose('', ['Zetalpa, Primal Dawn']);
    tg.passTo('declareAttackers');
    expect(tg.all('Zetalpa, Primal Dawn')).toHaveLength(1);
  });
});
