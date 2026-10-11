import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/actions.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Smuggler's Share";
const ilhas = Array(10).fill('Island');

describe(N, () => {
  it('na etapa final, compra uma carta para cada oponente que comprou duas ou mais e cria um Treasure para cada um que teve dois ou mais terrenos entrando', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N], [], []], library: [ilhas, ilhas, ilhas] });
    // Bia compra duas cartas e tem dois terrenos entrando; Caio compra uma e tem um terreno
    tg.run(draw(tg.g, 1, 2));
    tg.run(draw(tg.g, 2, 1));
    enterCard(tg, 'Forest', 1);
    enterCard(tg, 'Forest', 1);
    enterCard(tg, 'Forest', 2);
    tg.passTo('upkeep', 2);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Treasure')].controller).toBe(0);
  });

  it('as suas próprias compras e terrenos não contam, e sem nada o gatilho não faz nada', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ilhas] });
    tg.run(draw(tg.g, 0, 3));
    enterCard(tg, 'Forest', 0);
    enterCard(tg, 'Forest', 0);
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.all('Treasure')).toHaveLength(0);
  });
});
