import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Bite Down';

describe(N, () => {
  it('a criatura alvo sua causa dano igual à força dela à criatura que você não controla', () => {
    const tg = setup({ battlefield: [['Ripjaw Raptor', 'Forest', 'Forest'], ['Wall of Omens']], hand: [[N], []] });
    tg.choose('criatura alvo que você controla', ['Ripjaw Raptor']).choose('criatura ou planeswalker alvo', ['Wall of Omens']).cast(N).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
  });

  it('com a criatura dela fora do campo, não há dano', () => {
    const tg = setup({ active: 1, battlefield: [['Ripjaw Raptor', 'Forest', 'Forest'], ['Wall of Omens', 'Swamp', 'Swamp']], hand: [[N], ['Infernal Grasp']] });
    tg.pass();
    tg.choose('criatura alvo que você controla', ['Ripjaw Raptor']).choose('criatura ou planeswalker alvo', ['Wall of Omens']).cast(N).pass();
    tg.choose('criatura alvo', ['Ripjaw Raptor']).cast('Infernal Grasp');
    tg.resolveAll();
    expect(tg.find('Ripjaw Raptor')).toBeNull();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});
