import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Throne of the High City';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('CR 725.1: o jogo começa sem monarca; ao resolver, você se torna o monarca', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []] });
    expect(tg.state.monarch).toBeNull();
    tg.activate(NOME, 'monarca');
    expect(tg.find(NOME)).toBeNull(); // sacrificado como custo
    expect(tg.state.monarch).toBeNull();
    tg.resolve();
    expect(tg.state.monarch).toBe(0);
  });
  it('CR 725.2: o monarca compra uma carta no começo da etapa final dele', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring'], []], library: [['Island', 'Forest'], []] });
    tg.activate(NOME, 'monarca').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
