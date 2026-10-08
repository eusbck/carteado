import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Mind Stone', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Mind Stone')).toEqual(['C']));
  it('{1}, {T}, sacrifique: compre uma carta', () => {
    const tg = setup({ battlefield: [['Mind Stone', 'Plains'], []], library: [['Island'], []] });
    tg.activate('Mind Stone', 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Mind Stone']);
  });
});
