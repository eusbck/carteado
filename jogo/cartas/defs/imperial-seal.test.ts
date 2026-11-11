import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Imperial Seal';

describe(NOME, () => {
  it('procura uma carta, ela fica no topo e você perde 2 de vida; é feitiço', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME], []], library: [['Island', 'Zetalpa, Primal Dawn', 'Plains'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    expect(tg.names(0, 'library')[0]).toBe('Zetalpa, Primal Dawn');
    expect(tg.life(0)).toBe(38);
  });
});
