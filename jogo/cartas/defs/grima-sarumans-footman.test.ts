import { describe, expect, it } from 'vitest';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Gríma, Saruman's Footman";

describe(N, () => {
  it('não pode ser bloqueado; o jogador exila até uma instantânea ou feitiço, que você conjura de graça; o resto vai para o fundo', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']], library: [Array(6).fill('Island'), ['Swamp', 'Sol Ring', 'Consider', 'Island', 'Island']] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([1, 4]);
    tg.yes('Gríma', true);
    tg.attack([[N, 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1).some((b) => b.canBlock.includes(id))).toBe(false);
    tg.passTo('main2', 0);
    expect(tg.life(1)).toBe(39);
    // Consider (do oponente) foi conjurada por você: vigiou e comprou do seu grimório; vai para o cemitério do dono
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.names(1, 'graveyard')).toEqual(['Consider']);
    expect(tg.names(1, 'exile')).toEqual([]);
    expect(tg.names(1, 'library').slice(0, 2)).toEqual(['Island', 'Island']);
    expect(tg.names(1, 'library').slice(2).sort()).toEqual(['Sol Ring', 'Swamp']);
  });

  it('recusando, a instantânea vai para o fundo do grimório do dono com as outras', () => {
    const tg = setup({ battlefield: [[N], []], library: [Array(6).fill('Island'), ['Swamp', 'Consider', 'Island']] });
    tg.yes('Gríma', false);
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.names(1, 'library')[0]).toBe('Island');
    expect(tg.names(1, 'library').slice(1).sort()).toEqual(['Consider', 'Swamp']);
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });
});
