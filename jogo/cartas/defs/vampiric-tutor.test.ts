import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Vampiric Tutor';

describe(NOME, () => {
  it('procura uma carta, ela fica no topo do grimório e você perde 2 de vida', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []], library: [['Island', 'Forest', 'Zetalpa, Primal Dawn', 'Plains'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    expect(tg.names(0, 'library')[0]).toBe('Zetalpa, Primal Dawn');
    expect(tg.names(0, 'library')).toHaveLength(4);
    expect(tg.life(0)).toBe(38);
  });
});
