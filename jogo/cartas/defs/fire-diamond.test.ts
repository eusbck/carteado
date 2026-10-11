import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Fire Diamond', () => {
  it('CR 614.1c: entra virado', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [['Fire Diamond'], []] });
    tg.cast('Fire Diamond').resolve();
    expect(tg.state.objects[tg.bf('Fire Diamond')].tapped).toBe(true);
  });
  it('{T}: adiciona {R}', () => expect(alternativasDeMana('Fire Diamond')).toEqual(['R']));
});
