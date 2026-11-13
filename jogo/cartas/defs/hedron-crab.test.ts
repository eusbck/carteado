import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Hedron Crab";

describe(C, () => {
  it('queda de terreno: o jogador alvo moe três', () => {
    const tg = setup({ battlefield: [[C], []], hand: [['Forest'], []], library: [[], ['Opt', 'Opt', 'Opt', 'Opt']] });
    tg.choose('jogador alvo', ['Bruno']).play('Forest').resolveAll();
    expect(tg.state.zones.graveyard[1].length).toBe(3);
  });
});
