import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/api.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const N = 'Spinerock Knoll';
const forests = Array(10).fill('Forest');

/** joga o Knoll escondendo o Sol Ring e chega à sua próxima fase principal, com o Knoll desvirado */
function comCartaEscondida(): TestGame {
  const tg = setup({ battlefield: [['Mountain'], []], hand: [[N], []], library: [['Plains', 'Sol Ring', 'Swamp', 'Island', ...forests], forests] });
  tg.choose('Esconderijo', ['Sol Ring']).play(N).resolveAll();
  return tg;
}

describe(N, () => {
  it('esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado', () => {
    const tg = comCartaEscondida();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const exilio = tg.state.zones.exile.map((id) => tg.state.objects[id]);
    expect(exilio).toHaveLength(1);
    expect(exilio[0].def).toBe('Sol Ring');
    expect(exilio[0].faceDown).toBe(true);
    const lib = tg.state.zones.library[0].map((id) => tg.state.objects[id].def);
    expect(lib.slice(0, 10)).toEqual(forests);
    expect([...lib.slice(10)].sort()).toEqual(['Island', 'Plains', 'Swamp']);
  });

  it('com 7 ou mais de dano num oponente neste turno, joga a carta escondida sem pagar', () => {
    const tg = comCartaEscondida();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    // o dano pode vir de qualquer fonte e em partes (3 + 4)
    dealDamage(tg.g, [{ source: tg.bf('Mountain'), target: { kind: 'player', id: 1 }, amount: 3, combat: false }]);
    dealDamage(tg.g, [{ source: tg.bf('Mountain'), target: { kind: 'player', id: 1 }, amount: 4, combat: false }]);
    tg.refresh();
    tg.yes(N, true).activate(N, 'sem pagar').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.state.zones.exile).toHaveLength(0);
    // pagou só o {R} da habilidade: a Mountain virou, e o Sol Ring saiu de graça
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('com menos de 7 de dano, a carta continua exilada', () => {
    const tg = comCartaEscondida();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    dealDamage(tg.g, [{ source: tg.bf('Mountain'), target: { kind: 'player', id: 1 }, amount: 6, combat: false }]);
    tg.refresh();
    tg.activate(N, 'sem pagar').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.state.zones.exile).toHaveLength(1);
  });
});
