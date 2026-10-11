import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lethal Scheme';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('destrói o alvo e cada criatura que convocou trama', () => {
    // {2}{B}{B}: duas Swamps e duas criaturas (o genérico)
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic', 'Silver Myr'], ['Indomitable Ancients']], hand: [[N, 'Hex', 'Hex'], []], library: [lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    const myr = tg.bf('Silver Myr');
    tg.choose('Convocar', ['Elvish Mystic', 'Silver Myr']).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']);
    tg.choose('Tramar', [elfo]).choose('Descarte', ['Hex']);
    tg.cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.state.objects[elfo].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[myr].counters['+1/+1']).toBe(1);
    // comprou duas e descartou duas
    expect(tg.names(0, 'hand')).toEqual(['Swamp', 'Swamp']);
  });

  it('sem convocar, ninguém trama', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Swamp'), 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []], library: [lib, lib] });
    tg.choose('Convocar', []).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
