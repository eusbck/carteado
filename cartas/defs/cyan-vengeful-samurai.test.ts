import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const CYAN = 'Cyan, Vengeful Samurai';

describe(CYAN, () => {
  it('custa {1} a menos por carta de criatura no cemitério', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [[CYAN], []], graveyard: [['Wall of Omens', 'Elvish Mystic', 'Indomitable Ancients', 'Zetalpa, Primal Dawn'], []] });
    expect(tg.canCast(CYAN)).toBe(true);
  });
  it('várias cartas saindo juntas disparam uma vez', () => {
    const tg = setup({ battlefield: [[CYAN, 'Perpetual Timepiece', 'Plains', 'Plains'], []], graveyard: [['Wall of Omens', 'Elvish Mystic'], []], library: [['Island'], []] });
    tg.choose('cartas alvo do seu cemitério', ['Wall of Omens', 'Elvish Mystic']).activate('Perpetual Timepiece', 'Embaralhe').resolve().resolveAll();
    expect(tg.pt(tg.bf(CYAN))).toEqual([4, 4]);
  });
});
