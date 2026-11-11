import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Mortuary Mire";

describe(C, () => {
  it('entra virado e põe uma criatura do cemitério no topo', () => {
    const tg = setup({ hand: [[C], []], graveyard: [['Elvish Mystic'], []], library: [['Opt'], []] });
    tg.choose('carta de criatura', ['Elvish Mystic']).play(C).resolveAll();
    expect(tg.state.objects[tg.bf(C)].tapped).toBe(true);
    expect(tg.state.objects[tg.state.zones.library[0][0]].def).toBe('Elvish Mystic');
  });
});
