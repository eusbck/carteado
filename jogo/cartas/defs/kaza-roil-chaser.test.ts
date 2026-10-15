import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Kaza, Roil Chaser';

describe(N, () => {
  it('reduz só o genérico, e só a próxima instantânea ou feitiço', () => {
    // Kaza e Talrand são Wizards: X = 2
    const tg = setup({
      battlefield: [[N, 'Talrand, Sky Summoner', 'Island', 'Island'], []],
      hand: [['Think Twice', 'Think Twice'], []], library: [['Plains', 'Swamp', 'Forest'], []],
    });
    tg.activate(N).resolve();
    // Think Twice ({1}{U}) sai por {U}
    tg.cast('Think Twice').resolveAll();
    const viradas = () => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped).length;
    expect(viradas()).toBe(1);
    // a segunda já custa o normal: uma Ilha só não paga
    expect(tg.canCast('Think Twice')).toBe(false);
  });

  it('mágica de criatura não usa a redução, que continua esperando a instantânea', () => {
    const tg = setup({
      battlefield: [[N, 'Island', 'Plains', 'Island'], []],
      hand: [['Wall of Omens', 'Think Twice'], []], library: [['Plains', 'Swamp'], []],
    });
    tg.activate(N).resolve();
    tg.cast('Wall of Omens').resolveAll();
    // Wall of Omens custou {1}{W}: sobrou uma Ilha
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && !tg.state.objects[id].tapped)).toHaveLength(1);
    // e o Think Twice ainda sai por {U}
    tg.cast('Think Twice').resolveAll();
    expect(tg.find('Think Twice', 'graveyard', 0)).not.toBeNull();
  });
});
