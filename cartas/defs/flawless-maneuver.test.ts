import { describe, expect, it } from 'vitest';
import { gainControl } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const FM = 'Flawless Maneuver';

describe('Flawless Maneuver', () => {
  it('suas criaturas ganham indestrutível até o fim do turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Wall of Omens'], ['Indomitable Ancients']], hand: [[FM], []] });
    tg.cast(FM).resolve();
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'indestructible')).toBe(false);
    tg.passTo('upkeep', 1);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'indestructible')).toBe(false);
  });

  it('CR 118.9: controlando um comandante, pode conjurar sem pagar o custo de mana', () => {
    const tg = setup({ battlefield: [[{ name: 'Gau, Feral Youth', commander: true }], []], hand: [[FM], []] });
    tg.cast(FM, 'comandante').resolve();
    expect(hasKw(tg.g, tg.bf('Gau, Feral Youth'), 'indestructible')).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([FM]);
  });

  it('sem comandante no campo, o custo alternativo não aparece', () => {
    const tg = setup({ battlefield: [['Wall of Omens'], []], hand: [[FM], []], command: [[{ name: 'Gau, Feral Youth', commander: true }], []] });
    expect(tg.canCast(FM)).toBe(false);
  });

  it('o comandante de outro jogador que você controla também serve', () => {
    const tg = setup({ battlefield: [[], [{ name: 'Gau, Feral Youth', commander: true }]], hand: [[FM], []] });
    expect(tg.canCast(FM)).toBe(false);
    gainControl(tg.g, tg.bf('Gau, Feral Youth'), 0, { kind: 'permanent' }, tg.bf('Gau, Feral Youth'));
    tg.refresh();
    expect(tg.canCast(FM)).toBe(true);
    tg.cast(FM, 'comandante').resolve();
    expect(hasKw(tg.g, tg.bf('Gau, Feral Youth'), 'indestructible')).toBe(true);
  });
});
