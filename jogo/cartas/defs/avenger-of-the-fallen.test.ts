import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Avenger of the Fallen';

describe(NOME, () => {
  it('ao atacar, cria uma ficha de Guerreiro atacando para cada carta de criatura no cemitério', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [[NOME], []], graveyard: [['Wall of Omens', 'Indomitable Ancients', 'Sol Ring'], []], library: [['Island'], ['Island']] });
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    const fichas = tg.all('Warrior');
    expect(fichas).toHaveLength(2);
    expect(fichas.every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
