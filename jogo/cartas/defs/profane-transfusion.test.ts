import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Profane Transfusion';
const pantanos = Array(9).fill('Swamp');

describe(N, () => {
  it('os dois jogadores trocam os totais de vida e você cria um Horror X/X com a diferença', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []] });
    tg.state.players[0].life = 7;
    const nomes = tg.state.players.map((p) => p.name);
    tg.choose('primeiro jogador alvo', [nomes[0]]).choose('segundo jogador alvo', [nomes[1]]).cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(7);
    const ficha = tg.bf('Horror');
    expect(tg.state.objects[ficha].controller).toBe(0);
    expect(tg.pt(ficha)).toEqual([33, 33]);
    expect(chars(tg.g, ficha).types.sort()).toEqual(['Artifact', 'Creature']);
    expect(chars(tg.g, ficha).colors).toEqual([]);
    // a troca é ganho e perda de vida (CR 701.12c)
    expect(tg.state.turnStats[0].lifeGained).toBe(33);
    expect(tg.state.turnStats[1].lifeLost).toBe(33);
  });

  it('CR 119.7: quem não pode ganhar vida não troca por um total maior, e a ficha usa a diferença que ficou', () => {
    // Everlasting Torment: os jogadores não podem ganhar vida
    const tg = setup({ battlefield: [[...pantanos, 'Everlasting Torment'], []], hand: [[N], []] });
    tg.state.players[0].life = 7;
    const nomes = tg.state.players.map((p) => p.name);
    tg.choose('primeiro jogador alvo', [nomes[0]]).choose('segundo jogador alvo', [nomes[1]]).cast(N).resolveAll();
    expect(tg.life(0)).toBe(7);
    expect(tg.life(1)).toBe(40);
    expect(tg.pt(tg.bf('Horror'))).toEqual([33, 33]);
  });

  it('com totais iguais, nada muda e a ficha 0/0 morre', () => {
    const tg = setup({ battlefield: [pantanos, []], hand: [[N], []] });
    const nomes = tg.state.players.map((p) => p.name);
    tg.choose('primeiro jogador alvo', [nomes[0]]).choose('segundo jogador alvo', [nomes[1]]).cast(N).resolveAll();
    expect(tg.life(0)).toBe(40);
    expect(tg.life(1)).toBe(40);
    expect(tg.find('Horror')).toBeNull();
  });
});
