import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Squall, SeeD Mercenary', () => {
  it('atacando sozinho, ganha golpe duplo; ao causar dano de combate, devolve um permanente de valor 3 ou menos', () => {
    const tg = setup({ battlefield: [[{ name: 'Squall, SeeD Mercenary', ready: true }], []], graveyard: [['Sol Ring', 'Archfiend of Depravity'], []], library: [['Island'], ['Island']] });
    tg.choose('valor de mana 3 ou menos', ['Sol Ring']);
    tg.attack([['Squall, SeeD Mercenary', 1]]).passTo('declareAttackers').resolveAll();
    expect(hasKw(tg.g, tg.bf('Squall, SeeD Mercenary'), 'double strike')).toBe(true);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(34);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('atacando com duas, nenhuma ganha golpe duplo', () => {
    const tg = setup({ battlefield: [[{ name: 'Squall, SeeD Mercenary', ready: true }, { name: 'Elvish Mystic', ready: true }], []], library: [['Island'], ['Island']] });
    tg.attack([['Squall, SeeD Mercenary', 1], ['Elvish Mystic', 1]]).passTo('declareAttackers').resolveAll();
    expect(hasKw(tg.g, tg.bf('Squall, SeeD Mercenary'), 'double strike')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'double strike')).toBe(false);
  });
});
