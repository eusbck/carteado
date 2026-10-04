import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Crackling Doom', () => {
  it('cada oponente sacrifica uma criatura de maior força; empates o jogador escolhe', () => {
    const tg = setup({
      players: 3,
      battlefield: [['Mountain', 'Plains', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens'], ['Arboreal Grazer', 'Wall of Omens']],
      hand: [['Crackling Doom'], [], []],
    });
    // Carla tem 0/3 e 0/4 empatados em força 0: escolhe qual sacrificar
    tg.choose('maior força', ['Arboreal Grazer']);
    tg.cast('Crackling Doom').resolve();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(2)).toBe(38);
    expect(tg.names(1, 'battlefield')).toEqual(['Wall of Omens']); // Ancients (2) era a maior
    expect(tg.names(2, 'battlefield')).toEqual(['Wall of Omens']);
    expect(tg.life(0)).toBe(40);
  });

  it('proteção não impede o sacrifício', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', 'Swamp'], ['Indomitable Ancients']], hand: [['Crackling Doom'], []] });
    tg.cast('Crackling Doom').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
