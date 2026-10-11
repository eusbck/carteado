import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { activateMana, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Vorinclex, Voice of Hunger';

describe(N, () => {
  it('atropelar; virando um terreno para mana, você adiciona mais uma mana do tipo que ele produziu', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([7, 6]);
    expect(hasKw(tg.g, tg.bf(N), 'trample')).toBe(true);
    activateMana(tg, 'Forest', 'G');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['G', 'G']);
  });

  it('o terreno que o oponente virou para mana não desvira na próxima etapa de desvirar dele, só na seguinte', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island', 'Swamp']] });
    const ilha = tg.bf('Island');
    activateMana(tg, 'Island', 'U');
    // sem mana a mais para o oponente
    expect(tg.state.players[1].manaPool.map((u) => u.type)).toEqual(['U']);
    tg.resolveAll();
    expect(tg.state.objects[ilha].data.skipNextUntap).toBe(true);
    // ruling 3: vale mesmo que Vorinclex saia do campo
    removeCard(tg, tg.bf(N));
    // virado sem ser para mana, o Swamp desvira normalmente
    tg.state.objects[tg.bf('Swamp')].tapped = true;
    tg.g.bump();
    tg.passTo('upkeep', 0).passTo('main1', 1);
    expect(tg.state.objects[ilha].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(false);
    tg.passTo('upkeep', 0).passTo('main1', 1);
    expect(tg.state.objects[ilha].tapped).toBe(false);
  });
});