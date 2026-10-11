import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Mind's Dilation";

describe(N, () => {
  it('na primeira mágica do oponente no turno, ele exila o topo do grimório e você pode conjurar a carta de graça', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island', 'Island']], hand: [[], ['Sol Ring', 'Sol Ring']], library: [Array(4).fill('Forest'), ['Indomitable Ancients', 'Forest', 'Forest']] });
    tg.yes("Mind's Dilation", true);
    tg.cast('Sol Ring');
    // o gatilho resolve antes da mágica que o disparou
    tg.resolve();
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    const anciao = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[anciao].controller).toBe(0);
    expect(tg.state.objects[anciao].owner).toBe(1);
    expect(tg.names(1, 'battlefield')).not.toContain('Sol Ring');
    tg.resolveAll();
    expect(tg.names(1, 'battlefield')).toContain('Sol Ring');
  });

  it('terreno exilado fica no exílio; a segunda mágica do turno não dispara', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island', 'Island']], hand: [[], ['Sol Ring', 'Sol Ring']], library: [Array(4).fill('Forest'), ['Forest', 'Indomitable Ancients', 'Forest']] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Forest']);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Forest']);
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
