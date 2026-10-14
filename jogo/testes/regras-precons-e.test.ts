// Recursos do motor acrescentados para o deck Miracle Worker (precons-e). O milagre tem o próprio arquivo
// (testes/regras-milagre.test.ts).
import { describe, expect, it } from 'vitest';
import { hasKw, untilEndOfTurn } from '../motor/api.ts';
import type { Ctx } from '../motor/defs.ts';
import { setup } from './harness.ts';

describe('Recursos do motor (precons-e)', () => {
  it('CR 101.2: "não pode ter" (StaticDef.cantHave) vence quem dá a palavra-chave, mesmo com registro de data e hora posterior', () => {
    // Archetype of Imagination: "as criaturas dos oponentes perdem voar e não podem ter nem ganhar voar"
    const tg = setup({ battlefield: [['Archetype of Imagination'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']] });
    const ancients = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, tg.bf('Zetalpa, Primal Dawn'), 'flying')).toBe(false);
    untilEndOfTurn({ g: tg.g, you: 1, source: ancients } as unknown as Ctx, [ancients], [{ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'vigilance' }]);
    tg.g.bump();
    expect(hasKw(tg.g, ancients, 'flying')).toBe(false);
    expect(hasKw(tg.g, ancients, 'vigilance')).toBe(true);
  });
});
