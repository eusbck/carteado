import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Tainted Pact';

describe(NOME, () => {
  it('exila até escolher uma carta para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Forest', 'Zetalpa, Primal Dawn', 'Plains'], []] });
    tg.yes('colocar Island', false).yes('colocar Forest', false).yes('colocar Zetalpa', true);
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'exile').sort()).toEqual(['Forest', 'Island']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });

  it('para ao exilar duas cartas com o mesmo nome', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Forest', 'Island', 'Plains'], []] });
    tg.yes('colocar Island', false).yes('colocar Forest', false);
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(0, 'exile').sort()).toEqual(['Forest', 'Island', 'Island']);
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});
