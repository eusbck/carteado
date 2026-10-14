import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Kazuul, Tyrant of the Cliffs';

describe(NOME, () => {
  it('Bruno ataca você com duas criaturas: dois disparos; paga {3} por uma e você cria um Ogre pela outra', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients', 'Zetalpa, Primal Dawn', 'Mountain', 'Mountain', 'Mountain']] });
    tg.yes('Pagar {3}', true);
    tg.yes('Pagar {3}', false);
    tg.attack([['Indomitable Ancients', 0], ['Zetalpa, Primal Dawn', 0]]).passTo('declareBlockers', 1);
    expect(tg.all('Ogre').length).toBe(1);
    expect(tg.state.objects[tg.bf('Ogre')].controller).toBe(0);
  });

  it('atacar um planeswalker seu também conta', () => {
    const tg = setup({ active: 1, battlefield: [[NOME, "Elspeth, Sun's Champion"], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', { kind: 'obj', id: tg.bf("Elspeth, Sun's Champion") }]]).passTo('declareBlockers', 1);
    expect(tg.all('Ogre').length).toBe(1);
  });

  it('criatura que ataca outro jogador não dispara', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[NOME], ['Indomitable Ancients'], []] });
    tg.attack([['Indomitable Ancients', 2]]).passTo('declareBlockers', 1);
    expect(tg.all('Ogre').length).toBe(0);
  });
});
