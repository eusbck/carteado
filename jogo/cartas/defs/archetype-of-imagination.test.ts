import { describe, expect, it } from 'vitest';
import { hasKw, untilEndOfTurn } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';
import { enterCard } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const ARQ = 'Archetype of Imagination';

describe(ARQ, () => {
  it('as criaturas dos oponentes perdem voar, inclusive as que entram depois', () => {
    const tg = setup({ battlefield: [[ARQ, 'Wall of Omens'], ['Zetalpa, Primal Dawn']] });
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf(ARQ), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Zetalpa, Primal Dawn'), 'flying')).toBe(false);
    const nova = enterCard(tg, 'Prognostic Sphinx', 1)!;
    expect(hasKw(tg.g, nova, 'flying')).toBe(false);
  });

  it('um efeito posterior que daria voar à criatura do oponente não dá', () => {
    const tg = setup({ battlefield: [[ARQ], ['Indomitable Ancients']] });
    const id = tg.bf('Indomitable Ancients');
    untilEndOfTurn({ g: tg.g, you: 1, source: id } as unknown as Ctx, [id], [{ k: 'addKeyword', kw: 'flying' }]);
    tg.g.bump();
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });

  it('com um Archetype de cada lado, nenhuma criatura tem voar', () => {
    const tg = setup({ battlefield: [[ARQ, 'Wall of Omens'], [ARQ, 'Zetalpa, Primal Dawn']] });
    for (const id of tg.state.zones.battlefield) expect(hasKw(tg.g, id, 'flying')).toBe(false);
  });
});
