import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Jaws of Defeat', () => {
  it('a diferença é a maior menos a menor', () => {
    const tg = setup({ battlefield: [['Jaws of Defeat', 'Plains', 'Plains', 'Island'], []], hand: [['Wall of Omens'], []], library: [['Island'], []] });
    tg.cast('Wall of Omens').resolve();
    tg.resolveAll();
    expect(tg.life(1)).toBe(36); // 0/4
  });
});
