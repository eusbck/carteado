import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ephemerate', () => {
  it('pisca a criatura e vai para o exílio com ricochete', () => {
    const tg = setup({ battlefield: [['Plains', 'Elvish Mystic'], []], hand: [['Ephemerate'], []] });
    const antes = tg.bf('Elvish Mystic');
    tg.choose('criatura alvo', ['Elvish Mystic']).cast('Ephemerate').resolve();
    expect(tg.bf('Elvish Mystic')).not.toBe(antes);
    expect(tg.names(0, 'exile')).toContain('Ephemerate');
  });
});
