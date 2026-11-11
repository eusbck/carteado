import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Drivnod, Carnage Dominus";

describe(C, () => {
  it('gatilhos por criatura morrendo disparam uma vez a mais', () => {
    const tg = setup({ battlefield: [[C, 'The Meathook Massacre', 'Swamp', 'Memnite'], []], hand: [['Corrupted Conviction'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('Sacrifique', ['Memnite']).cast('Corrupted Conviction').resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
