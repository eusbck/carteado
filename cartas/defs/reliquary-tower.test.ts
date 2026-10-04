import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Reliquary Tower', () => {
  it('{T}: adiciona {C}', () => expect(alternativasDeMana('Reliquary Tower')).toEqual(['C']));
  it('CR 402.2, 514.1: sem tamanho máximo de mão, não descarta na limpeza', () => {
    const tg = setup({ step: 'end', battlefield: [['Reliquary Tower'], []], hand: [Array(10).fill('Plains'), []] });
    tg.pass().pass();
    expect(tg.state.zones.hand[0].length).toBe(10);
  });
});
