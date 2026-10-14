import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Swarmyard Massacre';

describe(NOME, () => {
  it('com um Rat e os dois Squirrels novos, as outras criaturas recebem -3/-3', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Rat', token: true }, 'Wall of Omens'], ['Indomitable Ancients', { name: 'Squirrel', token: true }]], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-1, 7]);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([-3, 1]);
    expect(tg.pt(tg.bf('Rat'))).toEqual([1, 1]);
    expect(tg.all('Squirrel').length).toBe(3);
  });
});
