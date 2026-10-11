import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Titan of Littjara';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('escolhe um tipo ao entrar, passa a ser desse tipo e compra pelas outras criaturas que compartilham um tipo', () => {
    // dois Elves seus (Elvish Mystic); o Silver Myr não compartilha tipo
    const tg = setup({ battlefield: [[...Array(6).fill('Island'), 'Elvish Mystic', 'Elvish Mystic', 'Silver Myr'], ['Elvish Mystic']], hand: [[N, 'Hex'], []], library: [lib, lib] });
    tg.choose('tipo de criatura', ['Elf']).yes('Titan of Littjara', true).choose('Descarte', ['Hex']);
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(chars(tg.g, id).subtypes.sort()).toEqual(['Elf', 'Illusion']);
    expect(tg.names(0, 'hand')).toEqual(['Swamp', 'Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Hex']);
  });

  it('ao atacar, compra de novo; sem criatura que compartilhe tipo, nada acontece', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Island'), 'Silver Myr'], []], hand: [[N], []], library: [lib, lib] });
    tg.choose('tipo de criatura', ['Elf']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    const com = setup({ battlefield: [[N, 'Indomitable Ancients'], []], library: [lib, lib] });
    // sem tipo escolhido (posta direto no campo), é só Illusion: não compartilha com Treefolk Warrior
    com.attack([[N, 1]]).passTo('main2', 0);
    expect(com.names(0, 'hand')).toEqual([]);
  });
});
