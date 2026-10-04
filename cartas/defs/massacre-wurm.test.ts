import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Massacre Wurm', () => {
  it('criaturas que morrem pelo -2/-2 também fazem o jogador perder 2', () => {
    const tg = setup({
      players: 3,
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Sol Ring', 'Sol Ring', 'Wall of Omens'], ['Elvish Mystic', 'Indomitable Ancients'], ['Arboreal Grazer']],
      hand: [['Massacre Wurm'], [], []],
    });
    tg.cast('Massacre Wurm').resolve().resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull(); // 1/1 com -2/-2 morre
    expect(tg.pt(tg.bf('Arboreal Grazer'))).toEqual([-2, 1]); // 0/3 sobrevive
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([0, 8]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]); // suas criaturas não
    expect(tg.life(1)).toBe(38); // Bruno perdeu o Elvish Mystic
    expect(tg.life(2)).toBe(40);
  });

  it('criatura que entra depois não recebe -2/-2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Sol Ring', 'Sol Ring'], []], hand: [['Massacre Wurm'], []] });
    tg.cast('Massacre Wurm').resolve().resolveAll();
    const [token] = tg.run(createTokens(tg.g, 1, 'Saproling', 1));
    expect(tg.pt(token)).toEqual([1, 1]);
  });
});
