import { describe, expect, it } from 'vitest';
import { createTokens, gainLife, loseLife } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = 'Strefan, Maurer Progenitor';
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('na sua etapa final, cria um Blood para cada jogador que perdeu vida no turno, mesmo que tenha ganhado depois', () => {
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [lib, lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    loseLife(tg.g, 1, 2, null);
    gainLife(tg.g, 1, 5, null);
    loseLife(tg.g, 0, 1, null);
    tg.passTo('upkeep', 1);
    expect(tg.all('Blood')).toHaveLength(2);
  });

  it('ao atacar, sacrificando dois Blood, põe um Vampire da mão no campo virado, atacando e indestrutível', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Vampire Nighthawk', 'Elvish Mystic'], []], library: [lib, lib] });
    runEffect(tg, createTokens(tg.g, 0, 'Blood', 2));
    tg.yes('Strefan', true).choose('Strefan', ['Vampire Nighthawk']);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.all('Blood')).toHaveLength(0);
    const gaviao = tg.bf('Vampire Nighthawk');
    expect(tg.state.objects[gaviao].tapped).toBe(true);
    expect(hasKw(tg.g, gaviao, 'indestructible')).toBe(true);
    expect(tg.state.combat?.attackers.some((a) => a.id === gaviao)).toBe(true);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
  });

  it('com menos de dois Blood, nada é oferecido', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Vampire Nighthawk'], []], library: [lib, lib] });
    runEffect(tg, createTokens(tg.g, 0, 'Blood', 1));
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Blood')).toHaveLength(1);
    expect(tg.find('Vampire Nighthawk')).toBeNull();
  });
});
