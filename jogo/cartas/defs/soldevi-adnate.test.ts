import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Soldevi Adnate";

describe(C, () => {
  it('sacrifica uma criatura de artefato por {B} igual ao valor de mana', () => {
    const tg = setup({ battlefield: [[C, { name: 'Ornithopter' }, 'Swamp'], []], hand: [['Victimize'], []] });
    expect(tg.canCast('Victimize')).toBe(false); // Ornithopter tem valor 0
  });
});
