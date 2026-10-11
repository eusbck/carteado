import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Akroma's Vengeance";
const planicies = Array(6).fill('Plains');

describe(N, () => {
  it('destrói todos os artefatos, criaturas e encantamentos; terrenos e planeswalkers ficam', () => {
    const tg = setup({ battlefield: [[...planicies, 'Serra Angel', 'Righteous Cause'], ['Sol Ring', 'Indomitable Ancients', 'Island', 'Darksteel Ingot']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Righteous Cause')).toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Island')).not.toBeNull();
    // indestrutível não é destruído
    expect(tg.find('Darksteel Ingot')).not.toBeNull();
    expect(tg.all('Plains')).toHaveLength(6);
  });

  it('ciclagem {3}: descarta esta carta e compra uma', () => {
    const tg = setup({ battlefield: [planicies, ['Sol Ring']], hand: [[N], []], library: [['Island', 'Island'], []] });
    tg.activate(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
});