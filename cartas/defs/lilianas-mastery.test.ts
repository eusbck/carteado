import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Liliana's Mastery";

describe(NOME, () => {
  it('ao entrar cria duas fichas Zombie 2/2, que ficam 3/3; Zombies seus recebem +1/+1, os do oponente e não Zombies não', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Limbs', 'Viscera Seer'], [{ name: 'Zombie 2/2', token: true }]],
      hand: [[NOME], []],
    });
    tg.cast(NOME).resolveAll();
    const minhas = tg.all('Zombie').filter((id) => tg.state.objects[id].controller === 0);
    expect(minhas.length).toBe(2);
    expect(minhas.map((id) => tg.pt(id))).toEqual([[3, 3], [3, 3]]);
    expect(tg.pt(tg.bf('Wall of Limbs'))).toEqual([1, 4]);
    expect(tg.pt(tg.bf('Viscera Seer'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Zombie', 1))).toEqual([2, 2]);
  });
});
