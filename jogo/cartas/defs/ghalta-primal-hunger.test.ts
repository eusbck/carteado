import { describe, expect, it } from 'vitest';
import { addEffect, hasKw, manaValue } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Ghalta, Primal Hunger';
const ancioes = ['Indomitable Ancients', 'Indomitable Ancients', 'Indomitable Ancients'];

describe(N, () => {
  it('com força total 6, custa {4}{G}{G}; o valor de mana continua 12', () => {
    const tg = setup({ battlefield: [[...ancioes, ...Array(6).fill('Forest')], []], hand: [[N], []] });
    tg.cast(N).resolve();
    const g = tg.bf(N);
    expect(manaValue(tg.g, g)).toBe(12);
    expect(hasKw(tg.g, g, 'trample')).toBe(true);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Forest' && tg.state.objects[id].tapped)).toHaveLength(6);
  });

  it('força negativa subtrai da força total', () => {
    const tg = setup({ battlefield: [[...ancioes, ...Array(6).fill('Forest')], []], hand: [[N], []] });
    // uma das três fica com força -2: total 2, custo {8}{G}{G}
    addEffect(tg.g, { source: tg.bf('Indomitable Ancients'), sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [tg.all('Indomitable Ancients')[0]], mods: [{ k: 'pt', p: -4, t: 0 }] });
    tg.refresh();
    expect(tg.canCast(N)).toBe(false);
  });

  it('a redução não passa de {G}{G}', () => {
    const tg = setup({ battlefield: [['Zetalpa, Primal Dawn', ...ancioes, 'Forest'], []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    const tg2 = setup({ battlefield: [['Zetalpa, Primal Dawn', ...ancioes, 'Forest', 'Forest'], []], hand: [[N], []] });
    tg2.cast(N).resolve();
    expect(tg2.find(N)).not.toBeNull();
  });
});
