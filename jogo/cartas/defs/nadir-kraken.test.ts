import { describe, expect, it } from 'vitest';
import { draw, exile } from '../../motor/api.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Nadir Kraken';
const lib = Array(10).fill('Island');

describe(N, () => {
  it('um gatilho por carta comprada; pagando {1}, ganha um marcador e um Tentacle', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 3]);
    tg.yes('Pagar', true).yes('Pagar', true);
    runEffect(tg, draw(tg.g, 0, 2));
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([4, 5]);
    expect(tg.all('Tentacle')).toHaveLength(2);
    expect(tg.pt(tg.all('Tentacle')[0])).toEqual([1, 1]);
  });

  it('se o Kraken já saiu do campo, pagando {1} ainda vem o Tentacle', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [lib, lib] });
    tg.yes('Pagar', true);
    runEffect(tg, draw(tg.g, 0, 1));
    tg.run(exile(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.all('Tentacle')).toHaveLength(1);
  });
});
