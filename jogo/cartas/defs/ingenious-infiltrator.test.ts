import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Ingenious Infiltrator';

describe(N, () => {
  it('compra uma carta por Ninja que causa dano de combate a um jogador (não por outras criaturas)', () => {
    const tg = setup({ battlefield: [[N, 'Universal Automaton', 'Memnite'], []], library: [['Forest', 'Island', 'Swamp'], []] });
    tg.attack([[N, 1], ['Universal Automaton', 1], ['Memnite', 1]]).passTo('main2', 0);
    // Infiltrator e Universal Automaton (polimorfo) são Ninjas; Memnite não
    expect(tg.names(0, 'hand').length).toBe(2);
  });
});
