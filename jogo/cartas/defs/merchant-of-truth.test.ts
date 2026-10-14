import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Merchant of Truth';

describe(N, () => {
  it('morrendo junto com outras criaturas suas, dispara para cada uma', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', N, 'Segovian Angel', { name: 'Spirit 1/1', token: true }], ['Baleful Strix']],
      hand: [['Day of Judgment'], []],
    });
    tg.cast('Day of Judgment').resolveAll();
    // Merchant e Segovian Angel (a ficha e a criatura do oponente não contam)
    expect(tg.all('Clue')).toHaveLength(2);
  });

  it('cada Clue dá uma instância de exaltado', () => {
    const tg = setup({ battlefield: [[N, 'Segovian Angel', { name: 'Clue', token: true }, { name: 'Clue', token: true }], []] });
    tg.attack([['Segovian Angel', 1]]).passTo('declareBlockers');
    expect(tg.pt(tg.bf('Segovian Angel'))).toEqual([3, 3]);
  });
});
