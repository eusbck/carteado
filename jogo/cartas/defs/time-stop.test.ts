import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Time Stop';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('CR 724.1: exila tudo na pilha, inclusive Time Stop, tira as criaturas do combate e vai direto para a limpeza', () => {
    const tg = setup({ battlefield: [[...ilhas(7), 'Indomitable Ancients'], []], hand: [[N, 'Consider', ...ilhas(9)], []] });
    tg.attack([['Indomitable Ancients', 1]]).passTo('declareBlockers');
    tg.cast('Consider').cast(N);
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    // as duas mágicas foram exiladas e nenhuma resolveu
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.find('Consider', 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).not.toContain('Consider');
    // sem dano de combate; o turno acabou e a limpeza aconteceu inteira (descarte até sete cartas)
    expect(tg.life(1)).toBe(40);
    expect(tg.state.combat).toBeNull();
    expect(tg.state.turn.active).toBe(1);
    expect(tg.state.turn.step).toBe('upkeep');
    expect(tg.names(0, 'hand')).toHaveLength(7);
  });

  it('CR 724.1e: os gatilhos de "no início da etapa final" não disparam no turno encerrado', () => {
    // Smuggler's Share compraria uma carta na etapa final: o oponente comprou duas neste turno
    const tg = setup({ battlefield: [[...ilhas(6), "Smuggler's Share"], []], hand: [[N], []] });
    tg.run(draw(tg.g, 1, 2));
    tg.cast(N).resolve();
    expect(tg.state.turn.active).toBe(1);
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('no turno de outro jogador, encerra o turno dele', () => {
    const tg = setup({ active: 1, battlefield: [ilhas(6), ['Indomitable Ancients']], hand: [[N], []] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers');
    while (tg.pending?.player !== 0) tg.pass();
    tg.cast(N).resolve();
    expect(tg.life(0)).toBe(40);
    expect(tg.state.turn.active).toBe(0);
  });
});
