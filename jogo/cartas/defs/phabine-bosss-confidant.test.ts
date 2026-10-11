import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = "Phabine, Boss's Confidant";

describe(N, () => {
  it('as suas fichas de criatura têm ímpeto', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 6]);
    runEffect(tg, createTokens(tg.g, 0, 'Cat', 1));
    runEffect(tg, createTokens(tg.g, 1, 'Cat', 1));
    const [meu, dele] = [0, 1].map((p) => tg.all('Cat').find((id) => tg.state.objects[id].controller === p)!);
    expect(hasKw(tg.g, meu, 'haste')).toBe(true);
    expect(hasKw(tg.g, dele, 'haste')).toBe(false);
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'haste')).toBe(false);
  });

  it('parlamentar: um Citizen por terreno revelado, +1/+1 por carta que não é terreno, e cada jogador compra', () => {
    // você revela Sol Ring (não terreno), Bruno revela Forest (terreno), Carla revela Hex (não terreno)
    const tg = setup({ players: 3, battlefield: [[N], [], []], library: [['Sol Ring', 'Forest'], ['Forest', 'Forest'], ['Hex', 'Forest']] });
    tg.passTo('declareAttackers');
    const cidadao = tg.bf('Citizen');
    expect(tg.pt(cidadao)).toEqual([3, 3]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 8]);
    expect(hasKw(tg.g, cidadao, 'haste')).toBe(true);
    expect([0, 1, 2].map((p) => tg.names(p, 'hand'))).toEqual([['Sol Ring'], ['Forest'], ['Hex']]);
  });
});
