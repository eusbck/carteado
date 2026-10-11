import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Soul of Eternity';

describe(N, () => {
  it('a força e a resistência são iguais ao seu total de vida', () => {
    const tg = setup({ battlefield: [[N], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([40, 40]);
    tg.state.players[0].life = 13;
    tg.g.bump();
    expect(tg.pt(id)).toEqual([13, 13]);
  });

  it('bis: uma ficha cópia para cada oponente, com ímpeto, sacrificada na etapa final', () => {
    const tg = setup({ players: 3, battlefield: [Array(9).fill('Plains'), [], []], graveyard: [[N], [], []] });
    // com 5 de vida as fichas são 5/5: atacam sem acabar com a partida
    tg.state.players[0].life = 5;
    tg.refresh();
    tg.activate(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    const fichas = tg.all(N);
    expect(fichas).toHaveLength(2);
    for (const id of fichas) {
      expect(tg.state.objects[id].isToken).toBe(true);
      expect(hasKw(tg.g, id, 'haste')).toBe(true);
      expect(tg.pt(id)).toEqual([5, 5]);
    }
    tg.passTo('upkeep', 1);
    expect(tg.all(N)).toHaveLength(0);
    // cada ficha atacou o oponente dela
    expect(tg.life(1)).toBe(35);
    expect(tg.life(2)).toBe(35);
  });
});