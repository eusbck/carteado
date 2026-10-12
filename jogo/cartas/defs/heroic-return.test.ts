import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Heroic Return';

describe(N, () => {
  it('devolve uma criatura do cemitério ao campo; o Hero entra com dois marcadores +1/+1 a mais', () => {
    const tg = setup({ battlefield: [Array(6).fill('Plains'), []], hand: [[N], []], graveyard: [['Patriot, Shield Wielder'], []] });
    tg.choose('carta de criatura alvo no seu cemitério', ['Patriot, Shield Wielder']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Patriot, Shield Wielder'))).toEqual([4, 4]);
  });

  it('custa {2} a menos se uma criatura está atacando você', () => {
    const tg = setup({ active: 1, battlefield: [Array(4).fill('Plains'), ['Serra Angel']], hand: [[N], []], graveyard: [['Silver Myr'], []] });
    tg.attack([['Serra Angel', 0]]).passTo('declareAttackers').pass();
    expect(tg.canCast(N)).toBe(true);
    tg.choose('carta de criatura alvo no seu cemitério', ['Silver Myr']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
  });
});