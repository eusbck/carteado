import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Ad Nauseam';

describe(NOME, () => {
  it('revela uma de cada vez e decide se continua', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Wall of Omens', 'Island', 'Zetalpa, Primal Dawn'], []] });
    tg.yes('Revelar outra', true);
    tg.yes('Revelar outra', false);
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Wall of Omens']);
    expect(tg.life(0)).toBe(38);
  });

  it('pode continuar com 0 ou menos de vida; perde o jogo ao parar', () => {
    const tg = setup({ life: 9, battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Zetalpa, Primal Dawn', 'Zetalpa, Primal Dawn', 'Island'], []] });
    tg.yes('Revelar outra', true);
    tg.yes('Revelar outra', false);
    tg.cast(NOME).resolve();
    expect(tg.state.players[0].lost).toBe(true);
  });
});
