import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Glimpse the Unthinkable";

describe(C, () => {
  it('o jogador alvo moe dez', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[C], []], library: [[], Array(12).fill('Opt')] });
    tg.choose('jogador alvo', ['Bruno']).cast(C).resolve();
    expect(tg.state.zones.graveyard[1].length).toBe(10);
  });
});
