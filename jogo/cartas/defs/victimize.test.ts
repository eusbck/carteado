import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Victimize";

describe(C, () => {
  it('sacrifica uma criatura e devolve duas viradas', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Swamp'), 'Memnite'], []], hand: [[C], []], graveyard: [['Elvish Mystic', 'Wall of Omens'], []], library: [['Opt'], []] });
    tg.choose('cartas de criatura', ['Elvish Mystic', 'Wall of Omens']).cast(C).resolve().resolveAll();
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.find('Memnite')).toBeNull();
  });
});
