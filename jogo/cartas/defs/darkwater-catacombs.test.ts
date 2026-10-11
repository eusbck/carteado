import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = "Darkwater Catacombs";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(["UB"]));
  it('{1}, {T}: precisa de outra fonte para pagar o {1}', () => {
    const so = setup({ battlefield: [[NOME], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    expect(so.canCast('Infernal Grasp')).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Plains'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp').resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
