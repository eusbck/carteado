import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Search the Premises';

describe(N, () => {
  it('cada criatura que ataca você faz você investigar; atacar outro jogador não', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[N], ['Slither Blade', 'Triton Shorestalker', 'Baleful Strix'], []] });
    tg.attack([['Slither Blade', 0], ['Triton Shorestalker', 0], ['Baleful Strix', 2]]).passTo('declareBlockers');
    expect(tg.all('Clue')).toHaveLength(2);
  });
});
