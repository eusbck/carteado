import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "T'Challa, the Black Panther";

describe(N, () => {
  it('entrando ou atacando, cria um Vibranium virado', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.all('Vibranium')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Vibranium')].tapped).toBe(true);
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.all('Vibranium')).toHaveLength(2);
  });

  it('conjurando um artefato de valor de mana 4 ou maior, ganha dois marcadores +1/+1', () => {
    // Thran Dynamo custa {4}; Sol Ring custa {1}
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Island')], []], hand: [['Thran Dynamo', 'Sol Ring'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    tg.cast('Thran Dynamo').resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
  });
});