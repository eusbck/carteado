import { describe, expect, it } from 'vitest';
import { controllerOf, hasKw } from '../../motor/api.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Hellkite Tyrant';
const aneis = (n: number) => Array(n).fill('Sol Ring');

describe(N, () => {
  it('tem voar e atropelar', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying') && hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
  });

  it('ao causar dano de combate a um jogador, ganha o controle de todos os artefatos dele', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Sol Ring', 'Silver Myr', 'Indomitable Ancients'], ['Mind Stone']] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(34);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Silver Myr'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(1);
    // só os do jogador que tomou o dano
    expect(controllerOf(tg.g, tg.bf('Mind Stone'))).toBe(2);
    // o controle não acaba no fim do turno
    tg.passTo('main1', 1);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });

  it('na manutenção, com vinte ou mais artefatos, você vence o jogo', () => {
    const tg = setup({ battlefield: [[N, ...aneis(20)], []], step: 'end', active: 1 });
    tg.passTo('upkeep', 0);
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });

  it('com dezenove artefatos, não dispara', () => {
    const tg = setup({ battlefield: [[N, ...aneis(19)], []], step: 'end', active: 1 });
    tg.passTo('draw', 0);
    expect(tg.state.gameOver).toBeNull();
  });

  it('com menos de vinte artefatos ao resolver, o gatilho não faz nada', () => {
    const tg = setup({ battlefield: [[N, ...aneis(20)], []], step: 'end', active: 1 });
    tg.passUntil((x) => x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0);
    removeCard(tg, tg.all('Sol Ring')[0]);
    tg.resolveAll();
    expect(tg.state.gameOver).toBeNull();
  });
});
