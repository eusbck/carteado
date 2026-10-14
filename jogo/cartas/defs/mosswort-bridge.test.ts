import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';

const N = 'Mosswort Bridge';
const forests = Array(10).fill('Forest');

/** joga a Bridge escondendo o Sol Ring e chega à sua próxima fase principal, com a Bridge desvirada */
function comCartaEscondida(criaturas: string[]): TestGame {
  const tg = setup({ battlefield: [['Forest', ...criaturas], []], hand: [[N], []], library: [['Plains', 'Sol Ring', 'Swamp', 'Island', ...forests], forests] });
  tg.choose('Esconderijo', ['Sol Ring']).play(N).resolveAll();
  return tg;
}

describe(N, () => {
  it('esconderijo 4 exila uma das quatro do topo virada para baixo e põe as outras no fundo; entra virado', () => {
    const tg = comCartaEscondida([]);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const exilio = tg.state.zones.exile.map((id) => tg.state.objects[id]);
    expect(exilio).toHaveLength(1);
    expect(exilio[0].def).toBe('Sol Ring');
    expect(exilio[0].faceDown).toBe(true);
    const lib = tg.state.zones.library[0].map((id) => tg.state.objects[id].def);
    expect([...lib.slice(10)].sort()).toEqual(['Island', 'Plains', 'Swamp']);
  });

  it('com força total 10 ou mais, joga a carta escondida sem pagar', () => {
    const tg = comCartaEscondida(['Gigantosaurus']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.yes(N, true).activate(N, 'sem pagar').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('com força total menor que 10, a carta continua exilada', () => {
    const tg = comCartaEscondida(['Ripjaw Raptor']);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.activate(N, 'sem pagar').resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.state.zones.exile).toHaveLength(1);
  });
});
