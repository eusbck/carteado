import { describe, expect, it } from 'vitest';
import { addEffect, chars } from '../../motor/api.ts';
import { canBlock, validateAttack } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Graaz, Unstoppable Juggernaut";
describe(N, () => {
  it("torna outras criaturas 5/3 Juggernaut, obriga atacar e impede Walls", () => {

    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Wall of Omens']] }); const id = tg.bf('Elvish Mystic'); expect(tg.pt(id)).toEqual([5, 3]); expect(chars(tg.g, id).subtypes).toContain('Juggernaut'); expect(validateAttack(tg.g, 0, [])).not.toBeNull(); expect(canBlock(tg.g, tg.bf('Wall of Omens'), id)).toBe(false);
    const src = tg.bf(N); addEffect(tg.g, { source: src, sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [src], mods: [{ k: 'loseAllAbilities' }] }); expect(tg.pt(id)).toEqual([5, 3]); expect(validateAttack(tg.g, 0, [])).toBeNull(); expect(canBlock(tg.g, tg.bf('Wall of Omens'), id)).toBe(true);
  });
});
