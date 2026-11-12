import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Moon-Circuit Hacker';

describe(N, () => {
  it('entrando pelo ninjutsu no turno, compra sem descartar', () => {
    const tg = setup({ battlefield: [['Memnite', 'Island'], []], hand: [[N], []], library: [['Forest'], []] });
    tg.yes('comprar', true);
    tg.attack([['Memnite', 1]]).passTo('declareBlockers');
    tg.activate(N, 'Ninjutsu').resolveAll();
    tg.passTo('main2', 0);
    expect(tg.names(0, 'hand').sort()).toEqual(['Forest', 'Memnite']);
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
  it('se já estava no campo, compra e descarta', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Swamp'], []], library: [['Forest'], []] });
    tg.yes('comprar', true);
    tg.choose('Descarte', ['Swamp']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.names(0, 'graveyard')).toEqual(['Swamp']);
  });
});
