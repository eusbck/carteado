import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Grim Backwoods', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Grim Backwoods')).toEqual(['C']));
  it('{2}{B}{G}, {T}, sacrifica uma criatura: compra uma carta', () => {
    const tg = setup({ battlefield: [['Grim Backwoods', 'Swamp', 'Forest', 'Sol Ring', 'Wall of Omens'], []], library: [['Island'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).activate('Grim Backwoods', 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});
