import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Damocles Base, Sword of Kang';
const lib = Array(8).fill('Swamp');
const tripular = (tg: ReturnType<typeof setup>) => tg.choose('Tripular', ['The Frightful Four']).activate(N, 'Tripular').resolveAll();

describe(N, () => {
  it('tripular 3: vira criatura artefato 5/5 com voar e toque mortífero', () => {
    const tg = setup({ battlefield: [[N, 'The Frightful Four'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
    tripular(tg);
    expect(chars(tg.g, id).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'deathtouch')).toBe(true);
  });

  it('escolha vilanesca: o jogador sacrifica uma criatura que não é ficha', () => {
    const tg = setup({ battlefield: [[N, 'The Frightful Four'], ['Elvish Mystic']], library: [lib, lib] });
    tripular(tg);
    tg.choose('escolha vilanesca', ['sacrificar']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'battlefield')).toEqual([]);
    expect(tg.life(1)).toBe(35);
    expect(tg.names(0, 'hand')).toHaveLength(0);
  });

  it('escolha vilanesca: perde 2 de vida e você compra duas cartas; sacrificar sem criatura é permitido e não faz nada', () => {
    const tg = setup({ battlefield: [[N, 'The Frightful Four'], ['Elvish Mystic']], library: [lib, lib] });
    tripular(tg);
    tg.choose('escolha vilanesca', ['vida']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(33);
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(1, 'battlefield')).toEqual(['Elvish Mystic']);

    const vazio = setup({ battlefield: [[N, 'The Frightful Four'], []], library: [lib, lib] });
    tripular(vazio);
    vazio.choose('escolha vilanesca', ['sacrificar']);
    vazio.attack([[N, 1]]).passTo('main2', 0);
    expect(vazio.life(1)).toBe(35);
    expect(vazio.names(0, 'hand')).toHaveLength(0);
  });
});
