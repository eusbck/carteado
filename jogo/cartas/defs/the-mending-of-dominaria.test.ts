import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "The Mending of Dominaria";

describe(C, () => {
  it('capítulo I moe duas cartas', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Forest')], []], hand: [[C], []], library: [['Opt', 'Island', 'Opt'], []] });
    tg.lenient = true;
    tg.cast(C).resolveAll();
    expect(tg.state.zones.graveyard[0].length).toBe(2);
  });
});
