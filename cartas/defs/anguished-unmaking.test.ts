import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Anguished Unmaking', () => {
  it('exila o permanente não terreno alvo e você perde 3 de vida', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Sol Ring'], ['Zetalpa, Primal Dawn']], hand: [['Anguished Unmaking'], []] });
    tg.choose('permanente não terreno', ['Zetalpa, Primal Dawn']).cast('Anguished Unmaking').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.life(0)).toBe(37);
  });
});
