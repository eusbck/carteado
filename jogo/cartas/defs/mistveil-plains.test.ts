import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

describe('Mistveil Plains', () => {
  it('é Plains ({W}) e entra virado', () => {
    expect(alternativasDeMana('Mistveil Plains')).toEqual(['W']);
    expect(entraVirado('Mistveil Plains')).toBe(true);
  });
  it('com dois permanentes brancos, põe uma carta do cemitério no fundo do grimório', () => {
    const tg = setup({ battlefield: [['Mistveil Plains', 'Plains', 'Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }], []], graveyard: [['Swords to Plowshares'], []], library: [['Island'], []] });
    tg.choose('cemitério', ['Swords to Plowshares']).activate('Mistveil Plains', 'fundo').resolve();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Swords to Plowshares']);
  });
  it('terrenos são incolores e não contam como permanentes brancos', () => {
    const tg = setup({ battlefield: [['Mistveil Plains', 'Plains', 'Plains', 'Wall of Omens'], []], graveyard: [['Swords to Plowshares'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
