import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Showdown of the Skalds';
const lib = ['Sol Ring', 'Forest', 'Elvish Mystic', 'Hex', ...Array(8).fill('Mountain')];

describe(N, () => {
  it('I: exila as quatro cartas do topo viradas para cima; dá para jogá-las até o fim do seu próximo turno', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Plains', 'Plains', 'Island'], []], hand: [[N], []], library: [lib, Array(8).fill('Mountain')] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring', 'Forest', 'Elvish Mystic', 'Hex']);
    expect(tg.state.zones.exile.every((id) => !tg.state.objects[id].faceDown)).toBe(true);
    // joga o Sol Ring do exílio com a mana que sobrou
    tg.cast('Sol Ring', '*').resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // no seu próximo turno ainda dá para jogar o terreno; no turno seguinte, não
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    tg.play('Forest');
    expect(tg.find('Forest')).not.toBeNull();
    tg.passTo('main1', 1);
    tg.passTo('main1', 0);
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    expect(tg.names(0, 'exile').sort()).toEqual(['Elvish Mystic', 'Hex']);
  });

  it('II: neste turno, cada mágica que você conjura põe um marcador +1/+1 na criatura alvo', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Elvish Mystic', 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring'], []], library: [Array(8).fill('Mountain'), Array(8).fill('Mountain')] });
    tg.state.objects[tg.bf(N)].counters.lore = 1;
    tg.passTo('main1', 0);
    tg.resolveAll();
    tg.choose('criatura alvo', ['Elvish Mystic']);
    tg.cast('Sol Ring').resolveAll();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(2);
  });
});
