import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Dilma, Estocadora de Vento';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('cada encantamento conjurado põe um marcador de vento', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Ghostly Prison', 'Sol Ring'], []], library: [lib, lib] });
    tg.cast('Ghostly Prison').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.wind).toBe(1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.wind).toBe(1);
  });

  it('removendo três marcadores, você compra duas e cada oponente descarta uma', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { wind: 3 } }], []], hand: [[], ['Sol Ring']], library: [lib, lib] });
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.wind ?? 0).toBe(0);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
  });

  it('com dois marcadores, a habilidade não pode ser ativada', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { wind: 2 } }], []], library: [lib, lib] });
    expect(tg.actionIds().some((a) => a.startsWith('activate:'))).toBe(false);
  });
});
