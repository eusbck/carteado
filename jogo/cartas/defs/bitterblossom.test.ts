import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Bitterblossom', () => {
  it('na sua manutenção você perde 1 de vida e cria uma Faerie Rogue com voar', () => {
    const tg = setup({ step: 'untap', battlefield: [['Bitterblossom'], []], library: [['Island', 'Island'], ['Island']] });
    tg.passTo('draw');
    expect(tg.life(0)).toBe(39);
    const f = tg.bf('Faerie Rogue');
    expect(hasKw(tg.g, f, 'flying')).toBe(true);
  });
});
