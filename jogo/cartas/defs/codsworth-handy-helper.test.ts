import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Codsworth, Handy Helper';

describe(N, () => {
  it('os comandantes que você controla têm resguardo {2}; a mana {W}{W} só paga Auras e Equipamentos', () => {
    const tg = setup({ battlefield: [[N, { name: 'Serra Angel', commander: true }, 'Wall of Omens'], []], hand: [["Hero's Blade", 'Lotus Petal', 'Stoneforge Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 3]);
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'ward')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'ward')).toBe(false);
    expect(tg.canCast("Hero's Blade")).toBe(true);
    expect(tg.canCast('Stoneforge Mystic')).toBe(false);
  });

  it('{T}: anexa um Equipamento seu a uma criatura sua, esteja ele onde estiver', () => {
    const tg = setup({ battlefield: [[N, 'Shadowspear', 'Wall of Omens'], []] });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Shadowspear') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.script.push((d) => { const i = d.kind === 'select' ? d.items.find((x) => x.label === 'Wall of Omens') : undefined; return i ? { kind: 'select', ids: [i.id] } : null; });
    tg.activate(N, 'Anexe').resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(tg.bf('Wall of Omens'));
  });
});