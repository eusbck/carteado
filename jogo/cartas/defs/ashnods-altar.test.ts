import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Ashnod's Altar";

describe(C, () => {
  it('sacrifica uma criatura por {C}{C}', () => {
    const tg = setup({ battlefield: [[C, 'Memnite'], []], hand: [['Fabricate'], []] });
    expect(tg.canCast('Fabricate')).toBe(false); // precisa de {U}
    const tg2 = setup({ battlefield: [[C, 'Memnite', 'Island'], []], hand: [['Fabricate'], []] });
    expect(tg2.canCast('Fabricate')).toBe(true);
  });
});
