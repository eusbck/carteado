import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Darkness';

describe(N, () => {
  it('previne todo o dano de combate do turno, a jogadores e a criaturas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Serra Angel', 'Indomitable Ancients'], ['Wall of Omens']], hand: [[N], []] });
    const vida = tg.life(1);
    tg.cast(N).resolveAll();
    tg.attack([['Serra Angel', 1], ['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]).passTo('main2', 0);
    expect(tg.life(1)).toBe(vida);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});