import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Superior Foes of Spider-Man';

describe(N, () => {
  it('atropelar; conjurando mágica de valor 4 ou mais, exila o topo e pode jogar a carta; ao exilar outra, a anterior deixa de valer', () => {
    const tg = setup({
      battlefield: [[N, ...Array(8).fill('Swamp'), 'Island', 'Island'], []], hand: [['The Frightful Four', 'The Frightful Four', 'Silver Myr'], []],
      library: [['Sol Ring', 'Elvish Mystic', 'Island', 'Island'], Array(4).fill('Island')],
    });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    // valor de mana 2: não dispara
    tg.cast('Silver Myr').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([]);
    tg.yes('Superior Foes', true);
    tg.cast('The Frightful Four').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.includes(String(tg.state.zones.exile[0])))).toBe(true);
    // exila outra: Sol Ring deixa de poder ser jogado, Elvish Mystic não (não há mana verde), mas a permissão é dele
    tg.cast('The Frightful Four').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring', 'Elvish Mystic']);
    const anel = tg.state.zones.exile.find((x) => tg.state.objects[x].def === 'Sol Ring')!;
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.includes(String(anel)))).toBe(false);
  });

  it('é opcional', () => {
    const tg = setup({ battlefield: [[N, ...Array(4).fill('Swamp')], []], hand: [['The Frightful Four'], []], library: [['Sol Ring'], []] });
    tg.yes('Superior Foes', false);
    tg.cast('The Frightful Four').resolveAll();
    expect(tg.names(0, 'exile')).toEqual([]);
  });
});
