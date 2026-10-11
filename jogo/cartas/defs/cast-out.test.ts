import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Cast Out';
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('exila o permanente não terreno de um oponente até sair do campo; ciclagem {W}', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains')], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.choose('permanente não terreno alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);

    const ciclo = setup({ battlefield: [['Plains'], []], hand: [[N], []], library: [lib, lib] });
    ciclo.activate(N, 'Ciclagem').resolveAll();
    expect(ciclo.names(0, 'graveyard')).toEqual([N]);
    expect(ciclo.names(0, 'hand')).toEqual(['Forest']);
  });

  it('se Cast Out sai do campo antes de o gatilho resolver, nada é exilado', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains')], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.choose('permanente não terreno alvo', ['Indomitable Ancients']).cast(N);
    // a mágica resolve e o gatilho de entrar vai para a pilha
    tg.resolve();
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Indomitable Ancients']);
  });
});
