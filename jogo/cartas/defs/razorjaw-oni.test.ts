import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Razorjaw Oni';

describe(N, () => {
  it('criaturas pretas, de qualquer jogador, não podem bloquear', () => {
    // Thief of Sanity é azul e preta; Indomitable Ancients é branca
    const tg = setup({ battlefield: [[N], ['Thief of Sanity', 'Indomitable Ancients']] });
    expect(tg.pt(tg.bf(N))).toEqual([4, 5]);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).map((b) => tg.state.objects[b.obj].def)).toEqual(['Indomitable Ancients']);
  });
});