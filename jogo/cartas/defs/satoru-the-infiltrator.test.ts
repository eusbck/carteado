import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Satoru, the Infiltrator';

describe(N, () => {
  it('conjurada pagando mana, não compra; entrando pelo ninjutsu, compra', () => {
    const tg = setup({ battlefield: [['Memnite', 'Island', 'Swamp', 'Island', 'Island'], []], hand: [[N, 'Ninja of the Deep Hours'], []], library: [['Forest', 'Forest'], []] });
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Ninja of the Deep Hours']);
    tg.yes('Ninja of the Deep Hours: comprar', false);
    tg.attack([['Memnite', 1]]).passTo('declareBlockers');
    tg.activate('Ninja of the Deep Hours', 'Ninjutsu').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Memnite']);
  });
  it('Memnite conjurada por {0}: nenhuma mana gasta, compra', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Memnite'], []], library: [['Forest'], []] });
    tg.cast('Memnite').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
  it('fichas não contam', () => {
    const tg = setup({ battlefield: [[N, 'Moonblade Shinobi'], []], library: [['Forest'], []] });
    tg.attack([['Moonblade Shinobi', 1]]).passTo('main2', 0);
    expect(tg.find('Illusion')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
