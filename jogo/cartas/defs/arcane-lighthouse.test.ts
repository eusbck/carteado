import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

describe('Arcane Lighthouse', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Arcane Lighthouse')).toEqual(['C']));
  it('criaturas dos oponentes perdem resistência a magia até o fim do turno', () => {
    const tg = setup({ battlefield: [['Arcane Lighthouse', 'Plains', 'Plains'], ['Sylvan Caryatid']], hand: [['Swords to Plowshares'], []] });
    expect(tg.canCast('Swords to Plowshares')).toBe(false);
    tg.activate('Arcane Lighthouse', 'perdem').resolve();
    tg.choose('criatura alvo', ['Sylvan Caryatid']).cast('Swords to Plowshares').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Sylvan Caryatid']);
  });
  it('só afeta as criaturas dos oponentes na resolução', () => {
    const tg = setup({ battlefield: [['Arcane Lighthouse', 'Plains', 'Plains'], []], hand: [['Swords to Plowshares'], ['Sylvan Caryatid']] });
    tg.activate('Arcane Lighthouse', 'perdem').resolve();
    // uma criatura com resistência a magia que entra depois continua com ela
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Sylvan Caryatid', 'hand', 1)!, controller: 1 }], 'teste'));
    expect(tg.canCast('Swords to Plowshares')).toBe(false);
  });
});
