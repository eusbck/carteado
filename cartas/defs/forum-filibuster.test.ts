import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Forum Filibuster', () => {
  it('a Aura volta anexada à ficha nova', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Forum Filibuster'], []], graveyard: [['Ethereal Armor'], []], library: [['Island'], ['Island']] });
    tg.choose('Aura ou Equipamento', ['Ethereal Armor']);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve().resolve();
    const ink = tg.bf('Inkling');
    expect(tg.state.objects[tg.bf('Ethereal Armor')].attachedTo).toBe(ink);
    expect(tg.pt(ink)).toEqual([4, 3]);
  });
});
