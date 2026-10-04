import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Ash Barrens', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Ash Barrens')).toEqual(['C']));
  it('CR 702.29e: ciclagem de terreno básico busca um básico para a mão', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [['Ash Barrens'], []], library: [['Sol Ring', 'Swamp'], []] });
    tg.choose('terreno básico', ['Swamp']).activate('Ash Barrens', 'Ciclagem').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'graveyard')).toEqual(['Ash Barrens']);
  });
});
