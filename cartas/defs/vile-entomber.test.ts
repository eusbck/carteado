import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Vile Entomber', () => {
  it('ao entrar, coloca qualquer carta do grimório no cemitério', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Vile Entomber'], []], library: [['Island', 'Zetalpa, Primal Dawn'], []] });
    tg.choose('cemitério', ['Zetalpa, Primal Dawn']).cast('Vile Entomber').resolve().resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Zetalpa, Primal Dawn']);
  });
});
