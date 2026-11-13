import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Burnt Offering';

describe(NOME, () => {
  it('sacrifica ao conjurar e adiciona X em qualquer combinação de {B} e {R}', () => {
    // Zetalpa, Primal Dawn custa {6}{W}{W}: valor 8
    const tg = setup({ battlefield: [['Swamp', 'Zetalpa, Primal Dawn'], []], hand: [[NOME], []] });
    tg.choose('Sacrifique', ['Zetalpa, Primal Dawn']).number('quantas das 8', 3).cast(NOME);
    expect(tg.names(0, 'graveyard')).toEqual(['Zetalpa, Primal Dawn']);
    tg.resolve();
    expect(tg.state.players[0].manaPool.map((m) => m.type).sort()).toEqual(['B', 'B', 'B', 'R', 'R', 'R', 'R', 'R']);
  });

  it('sem criatura para sacrificar, não pode ser conjurada', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []] });
    expect(tg.canCast(NOME)).toBe(false);
  });
});
