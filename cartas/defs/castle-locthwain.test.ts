import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Castle Locthwain';

describe(NOME, () => {
  it('CR 605: produz {B}', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('CR 614.1c: entra virado sem um Swamp', () => expect(entraVirado(NOME, ['Island'])).toBe(true));
  it('entra desvirado com um Swamp (inclusive não básico)', () => {
    expect(entraVirado(NOME, ['Swamp'])).toBe(false);
    expect(entraVirado(NOME, ["Witch's Cottage"])).toBe(false);
  });
  it('compra e perde vida igual às cartas na mão, sem janela entre as duas coisas', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp'], []], hand: [['Plains', 'Plains'], []], library: [['Island', 'Forest'], []] });
    tg.activate(NOME, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Plains', 'Plains', 'Island']);
    expect(tg.life(0)).toBe(37);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});
