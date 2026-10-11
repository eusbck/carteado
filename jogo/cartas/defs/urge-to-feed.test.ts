import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Urge to Feed';

describe(N, () => {
  it('a criatura alvo recebe -3/-3 e os Vampires que você virar na resolução ganham um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Vampire Nighthawk', 'Stromkirk Condemned'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('Urge to Feed', ['Vampire Nighthawk']);
    tg.cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    const gaviao = tg.bf('Vampire Nighthawk');
    expect(tg.state.objects[gaviao].tapped).toBe(true);
    expect(tg.pt(gaviao)).toEqual([3, 4]);
    expect(tg.state.objects[tg.bf('Stromkirk Condemned')].tapped).toBe(false);
  });

  it('o seu Vampire de resistência 3 que é o alvo sobrevive se for virado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Vampire Nighthawk'], []], hand: [[N], []] });
    tg.choose('criatura alvo', ['Vampire Nighthawk']).choose('Urge to Feed', ['Vampire Nighthawk']);
    tg.cast(N).resolveAll();
    // 2/3 -3/-3 +1/+1 = 0/1
    expect(tg.pt(tg.bf('Vampire Nighthawk'))).toEqual([0, 1]);
  });
});
