import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Goblin Electromancer', () => {
  it('dois Electromancers reduzem {2}', () => {
    const tg = setup({ battlefield: [['Goblin Electromancer', 'Goblin Electromancer', 'Swamp'], []], hand: [["Night's Whisper"], []], library: [['Island', 'Island'], []] });
    tg.cast("Night's Whisper").resolve();
    expect(tg.names(0, 'hand').length).toBe(2);
  });

  it('CR 601.2f: cada um reduz {1} do genérico de instantâneas e feitiços; mágica de criatura não', () => {
    const um = setup({ battlefield: [['Goblin Electromancer', 'Island', 'Island'], []], hand: [['Deep Analysis', 'Guttersnipe'], []] });
    expect(um.canCast('Deep Analysis')).toBe(false); // {3}{U} - {1} = {2}{U}
    const dois = setup({ battlefield: [['Goblin Electromancer', 'Goblin Electromancer', 'Island', 'Island'], []], hand: [['Deep Analysis', 'Guttersnipe'], []] });
    expect(dois.canCast('Deep Analysis')).toBe(true); // {1}{U}
    const criatura = setup({ battlefield: [['Goblin Electromancer', 'Mountain', 'Mountain'], []], hand: [['Guttersnipe'], []] });
    expect(criatura.canCast('Guttersnipe')).toBe(false); // {2}{R} continua {2}{R}
  });
});
