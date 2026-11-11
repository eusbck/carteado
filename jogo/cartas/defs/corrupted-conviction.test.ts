import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Corrupted Conviction";

describe(C, () => {
  it('sacrifica uma criatura e compra duas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Memnite'], []], hand: [[C], []], library: [['Opt', 'Opt'], []] });
    tg.cast(C).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt', 'Opt']);
  });
});
