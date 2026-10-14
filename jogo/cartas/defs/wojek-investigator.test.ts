import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Wojek Investigator';

describe(N, () => {
  it('na sua manutenção, investiga uma vez para cada oponente com mais cartas na mão', () => {
    const tg = setup({
      players: 4, step: 'end', active: 3, battlefield: [[N], [], [], []],
      hand: [['Plains'], ['Plains', 'Plains'], ['Plains'], ['Plains', 'Plains', 'Plains']],
    });
    tg.passTo('draw', 0);
    // Bruno (2) e Diego (3) têm mais que Ana (1); Carla (1) não
    expect(tg.all('Clue')).toHaveLength(2);
  });
});
