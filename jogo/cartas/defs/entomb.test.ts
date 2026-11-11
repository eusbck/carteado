import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Entomb';

describe(NOME, () => {
  it('procura uma carta e a põe no cemitério', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []], library: [['Island', 'Zetalpa, Primal Dawn', 'Forest'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    expect(tg.names(0, 'graveyard').sort()).toEqual([NOME, 'Zetalpa, Primal Dawn'].sort());
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Island']);
  });
});
