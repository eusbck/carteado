import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Dragon Whelp';
const montanhas = (n: number) => Array(n).fill('Mountain');

describe(N, () => {
  it('ativada três vezes, só recebe +3/+0', () => {
    const tg = setup({ battlefield: [[N, ...montanhas(3)], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    for (let i = 0; i < 3; i++) tg.activate(N).resolveAll();
    expect(tg.pt(id)).toEqual([5, 3]);
    tg.passTo('upkeep', 1);
    expect(tg.find(N)).not.toBeNull();
  });

  it('ativada quatro vezes no turno, é sacrificada no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [[N, ...montanhas(4)], []] });
    for (let i = 0; i < 4; i++) tg.activate(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([6, 3]);
    tg.passTo('upkeep', 1);
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});