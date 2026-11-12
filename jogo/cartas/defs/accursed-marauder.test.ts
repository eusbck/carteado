import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Accursed Marauder';

describe(NOME, () => {
  it('cada jogador sacrifica uma criatura que não é ficha', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Indomitable Ancients'], [{ name: 'Thrull', token: true }, 'Wall of Omens']], hand: [[NOME], []] });
    tg.choose('Sacrifique', ['Indomitable Ancients']);
    tg.cast(NOME).resolveAll();
    expect(tg.find(NOME)).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.find('Thrull')).not.toBeNull();
  });

  it('sendo a única criatura que não é ficha, ela mesma é sacrificada', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
});
