import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Walking Bulwark', () => {
  it('atribui dano pela resistência; a força não muda', () => {
    const tg = setup({ battlefield: [['Walking Bulwark', 'Plains', 'Plains', { name: 'Wall of Omens', ready: false }], []], library: [['Island'], ['Island']] });
    tg.choose('com defensor', ['Wall of Omens']);
    tg.activate('Walking Bulwark').resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    tg.attack([['Wall of Omens', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(36);
  });
});
