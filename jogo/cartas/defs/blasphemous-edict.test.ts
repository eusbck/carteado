import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Blasphemous Edict";

describe(C, () => {
  it('cada jogador sacrifica treze criaturas', () => {
    const tg = setup({ battlefield: [[...Array(5).fill('Swamp'), 'Memnite'], ['Wall of Omens']], hand: [[C], []] });
    tg.cast(C).resolve();
    expect(tg.find('Memnite')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
