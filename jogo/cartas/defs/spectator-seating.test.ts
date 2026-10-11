import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Spectator Seating';

function jogar(jogadores: number, saem: number[] = []) {
  const tg = setup({ players: jogadores, battlefield: Array.from({ length: jogadores }, () => []), hand: [[NOME], ...Array.from({ length: jogadores - 1 }, () => [])] });
  for (const p of saem) tg.game.concede(p);
  tg.play(NOME);
  return tg.state.objects[tg.bf(NOME)].tapped;
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['R', 'W']));
  it('com três oponentes (4 jogadores), entra desvirado', () => expect(jogar(4)).toBe(false));
  it('com dois oponentes (3 jogadores), entra desvirado', () => expect(jogar(3)).toBe(false));
  it('com um oponente só (2 jogadores), entra virado', () => expect(jogar(2)).toBe(true));
  it('CR 800.4a: conta os oponentes de agora: com só um oponente restante, entra virado', () => {
    expect(jogar(4, [2])).toBe(false); // ainda há dois
    expect(jogar(4, [1, 3])).toBe(true);
  });
  it('posto no campo virado por um efeito, continua virado mesmo com dois oponentes', () => {
    // Arboreal Grazer põe um terreno da mão no campo virado
    const tg = setup({ players: 4, battlefield: [['Forest'], [], [], []], hand: [['Arboreal Grazer', NOME], [], [], []] });
    tg.choose('terreno da mão', [NOME]).cast('Arboreal Grazer').resolve().resolve();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
