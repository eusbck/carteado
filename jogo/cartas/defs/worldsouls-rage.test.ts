import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Worldsoul's Rage";

describe(N, () => {
  it('X de dano a qualquer alvo e até X terrenos da mão e/ou do cemitério no campo virados', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Forest', 'Forest', 'Forest'], []],
      hand: [[N, 'Swamp', 'Island'], []],
      graveyard: [['Plains'], []],
    });
    tg.number('valor de X', 2).choose('qualquer alvo', ['Bruno']).choose('coloque até 2', ['Swamp (mão)', 'Plains (cemitério)']).cast(N).resolve();
    expect(tg.life(1)).toBe(38);
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
