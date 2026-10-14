import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shadowmage Infiltrator';

describe(N, () => {
  it('CR 702.36b: medo — só criaturas artefato ou pretas bloqueiam', () => {
    // Baleful Strix é criatura artefato; Gonti, Lord of Luxury é preta; Indomitable Ancients é branca
    const tg = setup({ battlefield: [[N], ['Baleful Strix', 'Gonti, Lord of Luxury', 'Indomitable Ancients']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const podem = blockCandidates(tg.g, 1).filter((b) => b.canBlock.includes(tg.bf(N))).map((b) => tg.state.objects[b.obj].def).sort();
    expect(podem).toEqual(['Baleful Strix', 'Gonti, Lord of Luxury']);
  });
  it('com dano de combate, você pode comprar uma carta', () => {
    const tg = setup({ battlefield: [[N], []] });
    tg.yes('comprar', true);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    expect(tg.life(1)).toBe(39);
  });
});
