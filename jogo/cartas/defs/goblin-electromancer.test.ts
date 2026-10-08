import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Goblin Electromancer', () => {
  it('dois Electromancers reduzem {2}', () => {
    const tg = setup({ battlefield: [['Goblin Electromancer', 'Goblin Electromancer', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolve();
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
