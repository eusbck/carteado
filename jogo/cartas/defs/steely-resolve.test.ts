import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

describe('Steely Resolve', () => {
  it('as criaturas do tipo escolhido, de qualquer jogador, têm resistência a magia total', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], ['Dragon Whelp']], hand: [['Steely Resolve'], []] });
    tg.choose('escolha um tipo de criatura', ['Dragon']).cast('Steely Resolve').resolve();
    expect(hasKw(tg.g, tg.bf('Dragon Whelp'), 'shroud')).toBe(true);
  });
  it('outros tipos não', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Elvish Mystic'], []], hand: [['Steely Resolve'], []] });
    tg.choose('escolha um tipo de criatura', ['Dragon']).cast('Steely Resolve').resolve();
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'shroud')).toBe(false);
  });
});
