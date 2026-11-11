import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Gamble';

describe(NOME, () => {
  it('busca uma carta e descarta uma ao acaso, que pode ser a buscada', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[NOME], []], library: [['Island', 'Zetalpa, Primal Dawn'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    // com a mão só com a carta buscada, o descarte aleatório leva ela
    expect(tg.names(0, 'graveyard').sort()).toEqual([NOME, 'Zetalpa, Primal Dawn'].sort());
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('com outras cartas na mão, descarta uma delas ao acaso', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[NOME, 'Forest', 'Plains'], []], library: [['Island', 'Zetalpa, Primal Dawn'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(0, 'graveyard')).toHaveLength(2);
  });
});
