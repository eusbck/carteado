import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Terra, Herald of Hope', () => {
  it('transe mói duas e dá voar; o alvo é escolhido depois de pagar (gatilho reflexivo)', () => {
    const tg = setup({ battlefield: [[{ name: 'Terra, Herald of Hope', ready: true }, 'Plains', 'Plains'], []], library: [['Wall of Omens', 'Archfiend of Depravity', 'Island'], ['Island']] });
    tg.passTo('beginCombat').resolve();
    const t = tg.bf('Terra, Herald of Hope');
    expect(hasKw(tg.g, t, 'flying')).toBe(true);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Archfiend of Depravity', 'Wall of Omens']);
    tg.yes('pagar').choose('força 3 ou menos', ['Wall of Omens']);
    tg.attack([['Terra, Herald of Hope', 1]]).passTo('main2');
    expect(tg.life(1)).toBe(37);
    expect(tg.state.objects[tg.bf('Wall of Omens')].tapped).toBe(true);
  });
});
