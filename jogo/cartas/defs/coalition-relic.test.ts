import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Coalition Relic';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('{T}: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    activateMana(tg, N, 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
  });

  it('na sua primeira fase principal, troca os marcadores de carga por mana, uma cor para cada um', () => {
    const tg = setup({ battlefield: [[N], []], library: [lib, lib] });
    const id = tg.bf(N);
    tg.activate(N, 'marcador de carga').resolveAll();
    expect(tg.state.objects[id].counters.charge).toBe(1);
    tg.state.objects[id].counters.charge = 2;
    tg.choose('mana 1 de 2', ['R']).choose('mana 2 de 2', ['B']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.state.objects[id].counters.charge ?? 0).toBe(0);
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'R']);
  });
});
