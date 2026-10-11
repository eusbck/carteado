import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { attackingTarget } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ghalta and Mavren';

describe(N, () => {
  it('primeiro modo: um Dinosaur X/X virado e atacando, com X igual à maior força entre as outras atacantes', () => {
    // Serra Angel tem força 4; Silver Myr, 1
    const tg = setup({ battlefield: [[N, 'Serra Angel', 'Silver Myr'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([12, 12]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    tg.choose('escolha', ['Crie uma ficha de criatura Dinosaur X/X verde com atropelar, virada e atacando, onde X é a maior força entre as outras criaturas atacantes']);
    tg.attack([[N, 1], ['Serra Angel', 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    const dino = tg.bf('Dinosaur');
    expect(tg.pt(dino)).toEqual([4, 4]);
    expect(hasKw(tg.g, dino, 'trample')).toBe(true);
    expect(tg.state.objects[dino].tapped).toBe(true);
    expect(attackingTarget(tg.g, dino)).toEqual({ kind: 'player', id: 1 });
  });

  it('segundo modo: um Vampire 1/1 com vínculo com a vida para cada outra criatura atacante', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', 'Silver Myr'], []] });
    tg.choose('escolha', ['Crie X fichas de criatura Vampire 1/1 brancas com vínculo com a vida, onde X é o número de outras criaturas atacantes']);
    tg.attack([[N, 1], ['Serra Angel', 1], ['Silver Myr', 1]]).passTo('declareBlockers');
    const vampiros = tg.all('Vampire');
    expect(vampiros).toHaveLength(2);
    expect(hasKw(tg.g, vampiros[0], 'lifelink')).toBe(true);
  });

  it('sem outras atacantes, o Dinosaur é 0/0 e morre, e o segundo modo não cria Vampires', () => {
    const dino = setup({ battlefield: [[N], []] });
    dino.choose('escolha', ['Crie uma ficha de criatura Dinosaur X/X verde com atropelar, virada e atacando, onde X é a maior força entre as outras criaturas atacantes']);
    dino.attack([[N, 1]]).passTo('declareBlockers');
    expect(dino.find('Dinosaur')).toBeNull();
    const vamp = setup({ battlefield: [[N], []] });
    vamp.choose('escolha', ['Crie X fichas de criatura Vampire 1/1 brancas com vínculo com a vida, onde X é o número de outras criaturas atacantes']);
    vamp.attack([[N, 1]]).passTo('declareBlockers');
    expect(vamp.find('Vampire')).toBeNull();
  });
});