import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Warren Soultrader';

describe(N, () => {
  it('pague 1 de vida e sacrifique outra criatura: um Treasure', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    tg.choose('Sacrifique', ['Elvish Mystic']).activate(N, 'Treasure').resolve();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.bf('Treasure')).toBeTruthy();
    expect(tg.life(0)).toBe(39);
  });
  it('não pode sacrificar a si mesmo', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:') || a.startsWith('activate:'))).toBe(false);
  });
});
