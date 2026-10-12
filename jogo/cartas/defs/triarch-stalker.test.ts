import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Triarch Stalker';

describe(N, () => {
  it('no início do seu combate escolhe um oponente; as criaturas que atacam esse jogador têm ameaçar', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Serra Angel', 'Indomitable Ancients'], [], []] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
    tg.choose('Triarch Stalker: escolha um oponente', ['Bruno']).attack([['Serra Angel', 1], ['Indomitable Ancients', 2]]).passTo('declareBlockers', 0);
    expect(hasKw(tg.g, tg.bf('Serra Angel'), 'menace')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Indomitable Ancients'), 'menace')).toBe(false);
  });
});