import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Subjugate the Hobbits';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('ganha o controle de cada criatura não comandante com valor de mana 3 ou menos, sem prazo', () => {
    const tg = setup({ battlefield: [[...Array(7).fill('Island')], ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients', 'Guttersnipe']], hand: [[N], []], library: [lib, lib] });
    const [elfo, myr, anciao, goblin] = ['Elvish Mystic', 'Silver Myr', 'Indomitable Ancients', 'Guttersnipe'].map((n) => tg.bf(n));
    tg.state.cards[tg.state.objects[myr].card!].isCommander = true;
    tg.refresh();
    tg.cast(N).resolveAll();
    expect(controllerOf(tg.g, elfo)).toBe(0);
    expect(controllerOf(tg.g, goblin)).toBe(0);
    // o comandante e a criatura de valor de mana 4 ficam
    expect(controllerOf(tg.g, myr)).toBe(1);
    expect(controllerOf(tg.g, anciao)).toBe(1);
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(controllerOf(tg.g, elfo)).toBe(0);
  });
});
