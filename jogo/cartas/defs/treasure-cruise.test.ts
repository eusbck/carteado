import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Treasure Cruise', () => {
  it('só paga genérico; não exila mais que o genérico', () => {
    const tg = setup({
      battlefield: [['Island'], []], hand: [['Treasure Cruise'], []], graveyard: [Array(9).fill('Swamp'), []], library: [['Plains', 'Plains', 'Plains'], []],
    });
    let maximo = -1;
    tg.script.push((d) => (d.kind === 'number' && d.prompt.includes('exilar') ? (maximo = d.max, { kind: 'number', value: 7 }) : null));
    tg.cast('Treasure Cruise').resolve();
    expect(maximo).toBe(7);
    expect(tg.names(0, 'exile').length).toBe(7);
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains', 'Plains']);
  });
});
