import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Dark Ritual";

describe(C, () => {
  it('adiciona {B}{B}{B}', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.state.players[0].manaPool.length).toBe(3);
  });
});
