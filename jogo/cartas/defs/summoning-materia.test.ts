import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { buildView } from '../../motor/view.ts';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';
import { setup as setupCurto } from '../../testes/harness.ts';

const N = 'Summoning Materia';

describe(N, () => {
  it('você pode olhar a carta do topo do seu grimório a qualquer momento; o oponente não', () => {
    const tg = setupCurto({ battlefield: [[N], []], library: [['Serra Angel', 'Forest'], ['Island']] });
    expect(buildView(tg.g, 0, null).players[0].topCard?.name).toBe('Serra Angel');
    expect(buildView(tg.g, 1, null).players[0].topCard).toBeUndefined();
  });

  it('anexado a uma criatura, conjura do topo do grimório uma mágica de criatura, no tempo e pagando o custo dela', () => {
    const tg = setupCurto({ battlefield: [[N, 'Wall of Omens', 'Forest', 'Plains', 'Plains'], []], library: [['Elvish Mystic', 'Serra Angel', 'Lightning Bolt'], ['Island']] });
    // sem estar anexado, nada sai do topo
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    tg.activate(N, 'Equipar').resolve();
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    tg.cast('Elvish Mystic', '*').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    // a Serra Angel ({3}{W}{W}) não cabe na mana que sobrou: o custo continua valendo
    expect(tg.names(0, 'library')).toEqual(['Serra Angel', 'Lightning Bolt']);
    expect(tg.canCast('Serra Angel')).toBe(false);
  });

  it('só mágicas de criatura, e no tempo delas', () => {
    const tg = setupCurto({ battlefield: [[{ name: N, attachTo: 'Wall of Omens' }, 'Wall of Omens', 'Mountain', 'Forest'], []], library: [['Lightning Bolt', 'Elvish Mystic'], ['Island']] });
    expect(tg.canCast('Lightning Bolt')).toBe(false);
    const tg2 = setupCurto({ battlefield: [[{ name: N, attachTo: 'Wall of Omens' }, 'Wall of Omens', 'Forest'], []], library: [['Elvish Mystic'], ['Island']] });
    tg2.passTo('beginCombat', 0);
    expect(tg2.canCast('Elvish Mystic')).toBe(false);
  });

  it('a criatura equipada recebe +2/+2, vigilância e "{T}: Adicione {G}."', () => {
    const tg = setup({ battlefield: [[{ name: N, attachTo: 'Wall of Omens' }, 'Wall of Omens'], []] });
    const muro = tg.bf('Wall of Omens');
    expect(tg.pt(muro)).toEqual([2, 6]);
    expect(hasKw(tg.g, muro, 'vigilance')).toBe(true);
    activateMana(tg, 'Wall of Omens', 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G']);
    expect(tg.state.objects[muro].tapped).toBe(true);
  });
});
