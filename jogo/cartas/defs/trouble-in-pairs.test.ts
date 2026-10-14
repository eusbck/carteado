import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { draw } from '../../motor/api.ts';

const NOME = 'Trouble in Pairs';
const lib = Array(8).fill('Island');

describe(NOME, () => {
  it('Bruno ataca você com duas criaturas: você compra uma carta', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']], library: [lib, lib] });
    tg.attack([['Indomitable Ancients', 0], ['Zetalpa, Primal Dawn', 0]]).passTo('declareBlockers', 1);
    expect(tg.names(0, 'hand').length).toBe(1);
  });

  it('com uma criatura só, não', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Indomitable Ancients']], library: [lib, lib] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers', 1);
    expect(tg.names(0, 'hand').length).toBe(0);
  });

  it('a segunda compra do oponente no turno faz você comprar, mesmo com Trouble in Pairs entrando depois da primeira', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [lib, lib] });
    // a primeira compra de Bruno no turno já tinha acontecido
    tg.state.turnStats[1].cardsDrawn = 1;
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
    tg.run(draw(tg.g, 1, 1));
    tg.resolveAll();
    expect(tg.names(0, 'hand').length).toBe(1);
  });

  it('a segunda mágica do oponente no turno faz você comprar; a primeira e a terceira não', () => {
    const tg = setup({ active: 1, battlefield: [[NOME], ['Mountain', 'Mountain', 'Mountain']], hand: [[], ['Lightning Bolt', 'Lightning Bolt', 'Lightning Bolt']], library: [lib, lib] });
    for (let i = 0; i < 3; i++) {
      tg.choose('qualquer alvo', ['Ana']).cast('Lightning Bolt');
      tg.resolveAll();
    }
    expect(tg.names(0, 'hand').length).toBe(1);
  });
});
