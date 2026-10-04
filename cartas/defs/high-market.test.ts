import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('High Market', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('High Market')).toEqual(['C']));
  it('{T}, sacrifica uma criatura: ganha 1 de vida', () => {
    const tg = setup({ battlefield: [['High Market', 'Wall of Omens'], []] });
    tg.choose('Sacrifique', ['Wall of Omens']).activate('High Market', 'vida').resolve();
    expect(tg.life(0)).toBe(41);
  });
});
