import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Mana Confluence';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'G', 'R', 'U', 'W']));
  it('{T}, pague 1 de vida: uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    expect(tg.life(0)).toBe(39);
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
