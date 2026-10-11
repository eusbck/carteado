import { describe, expect, it } from 'vitest';
import { kwParams } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Feline Sovereign';
const lib = Array(10).fill('Forest');

describe(N, () => {
  it('os outros Cats seus recebem +1/+1 e têm proteção contra Dogs: um Dog não os bloqueia', () => {
    const tg = setup({ battlefield: [[N, 'King of the Pride'], ['Pack Leader']], library: [lib, lib] });
    const rei = tg.bf('King of the Pride');
    // King of the Pride 2/1 +1/+1 do Sovereign; o Sovereign 2/3 +2/+1 do King
    expect(tg.pt(rei)).toEqual([3, 2]);
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(kwParams(tg.g, rei, 'protection')).toContain('subtype:Dog');
    expect(kwParams(tg.g, tg.bf(N), 'protection')).not.toContain('subtype:Dog');
    tg.attack([[N, 1], ['King of the Pride', 1]]).passTo('declareBlockers');
    const cao = blockCandidates(tg.g, 1).find((b) => b.obj === tg.bf('Pack Leader'))!;
    expect(cao.canBlock).toEqual([tg.bf(N)]);
  });

  it('com dano de combate de um Cat seu, destrói até um artefato ou encantamento do jogador', () => {
    const tg = setup({ battlefield: [[N], ['Sol Ring', 'Impact Tremors']], library: [lib, lib] });
    tg.choose('artefato ou encantamento alvo', ['Impact Tremors']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'battlefield')).toEqual(['Sol Ring']);
    expect(tg.life(1)).toBe(38);
  });
});
