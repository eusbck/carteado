import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bishop of Wings';

describe(N, () => {
  it('um Angel seu que entra faz você ganhar 4 de vida', () => {
    const tg = setup({ battlefield: [[N], []] });
    enterCard(tg, 'Segovian Angel', 0);
    enterCard(tg, 'Slither Blade', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(44);
  });

  it('morrendo junto com Angels seus, dispara para cada um', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', N, 'Segovian Angel', 'Youthful Valkyrie'], ['Baleful Strix']], hand: [['Day of Judgment'], []] });
    tg.cast('Day of Judgment').resolveAll();
    expect(tg.all('Spirit')).toHaveLength(2);
  });
});
