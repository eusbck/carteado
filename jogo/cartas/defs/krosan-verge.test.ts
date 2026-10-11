import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';

const NOME = 'Krosan Verge';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('{2}, {T}, sacrifique: uma Forest e uma Plains (inclusive não básicas) no campo, viradas', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Island', 'Forest', 'Scrubland', 'Plains'], []] });
    tg.choose('procure uma carta de Forest', ['Forest']).choose('procure uma carta de Plains', ['Scrubland']);
    tg.activate(NOME, 'Procure').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Scrubland')].tapped).toBe(true);
    expect(tg.names(0, 'library').sort()).toEqual(['Island', 'Plains']);
  });
  it('sem Forest no grimório, ainda busca a Plains', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], library: [['Island', 'Plains'], []] });
    tg.choose('procure uma carta de Plains', ['Plains']);
    tg.activate(NOME, 'Procure').resolve();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
});
