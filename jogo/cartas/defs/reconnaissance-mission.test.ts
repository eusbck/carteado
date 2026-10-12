import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reconnaissance Mission';

describe(N, () => {
  it('um gatilho para cada criatura sua que causa dano de combate a um jogador, uma carta por gatilho', () => {
    const tg = setup({ battlefield: [[N, 'Serra Angel', 'Indomitable Ancients'], []], library: [Array(4).fill('Island'), ['Island']] });
    tg.yes('Reconnaissance Mission', true).yes('Reconnaissance Mission', true).attack([['Serra Angel', 1], ['Indomitable Ancients', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('ciclagem {2}', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Island', 'Island'], ['Island']] });
    tg.activate(N, 'Ciclagem').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});