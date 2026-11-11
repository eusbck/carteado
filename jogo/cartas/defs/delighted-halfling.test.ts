import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { counter } from '../../motor/api.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

describe('Delighted Halfling', () => {
  it('CR 605: {C} ou uma mana de qualquer cor', () => expect(alternativasDeMana('Delighted Halfling')).toEqual(['B', 'C', 'G', 'R', 'U', 'W']));
  it('gasta numa mágica lendária, ela não pode ser anulada; numa que não é lendária, não pode ser gasta', () => {
    // Kinnan ({G}{U}) é lendário
    const tg = setup({ battlefield: [['Delighted Halfling', 'Island'], []], hand: [['Kinnan, Bonder Prodigy'], []] });
    tg.cast('Kinnan, Bonder Prodigy');
    const sp = tg.state.zones.stack[0];
    expect(tg.run(counter(tg.g, sp))).toBe(false);
    tg.resolve();
    expect(tg.find('Kinnan, Bonder Prodigy', 'battlefield', 0)).not.toBeNull();
    const tg2 = setup({ battlefield: [['Delighted Halfling'], []], hand: [['Elvish Mystic'], []] });
    expect(tg2.canCast('Elvish Mystic')).toBe(false);
  });
});
