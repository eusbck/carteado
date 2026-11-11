import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Grave Pact";

describe(C, () => {
  it('quando sua criatura morre, cada outro jogador sacrifica uma criatura', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', 'Swamp', 'Swamp', 'Memnite', 'Elvish Mystic'], ['Wall of Omens', 'Ornithopter']], hand: [['Corrupted Conviction'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('Sacrifique', ['Memnite']).cast('Corrupted Conviction').resolveAll();
    expect(tg.all('Wall of Omens').length + tg.all('Ornithopter').length).toBe(1);
  });
});
