import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Venerated Stormsinger";

describe(C, () => {
  it('quando sua criatura morre, dreno de 1', () => {
    const tg = setup({ battlefield: [[C, 'Swamp', 'Memnite'], []], hand: [['Corrupted Conviction'], []], library: [['Opt', 'Opt'], []] });
    tg.choose('Sacrifique', ['Memnite']).cast('Corrupted Conviction').resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
});
