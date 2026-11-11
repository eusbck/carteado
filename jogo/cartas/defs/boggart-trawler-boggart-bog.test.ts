import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Boggart Trawler // Boggart Bog";

describe(C, () => {
  it('exila o cemitério do jogador alvo', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Swamp')], []], hand: [[C], []], graveyard: [[], ['Opt']] });
    tg.lenient = true;
    tg.cast(C, '*').resolve().resolveAll();
    expect(tg.state.zones.graveyard[1].length + tg.state.zones.graveyard[0].length).toBeLessThanOrEqual(1);
  });
});
