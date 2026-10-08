import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

const NOME = 'Gray Merchant of Asphodel';
const SWAMPS = ['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'];

describe(NOME, () => {
  it('híbridos, {2/B} e phyrexianos contam; genérico não', () => {
    // Merchant {3}{B}{B} = 2, Creakwood Liege {1}{B/G}{B/G}{B/G} = 3, Vraska {4}{B}{B/P} = 2,
    // The Reaper {2/B}{2/R}{2/G} = 1, Sol Ring {1} = 0; o {B} da criatura do oponente não conta
    const tg = setup({
      battlefield: [[...SWAMPS, 'Creakwood Liege', "Vraska, Betrayal's Sting", 'The Reaper, King No More', 'Sol Ring'], ['Viscera Seer']],
      hand: [[NOME], []],
    });
    tg.cast(NOME).resolveAll();
    expect(tg.life(1)).toBe(32);
    expect(tg.life(0)).toBe(48);
  });

  it('no multijogador, ganha o total perdido pelos oponentes', () => {
    const tg = setup({ players: 3, battlefield: [[...SWAMPS], [], []], hand: [[NOME], [], []] });
    tg.cast(NOME).resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([38, 38]);
    expect(tg.life(0)).toBe(44);
  });

  it('a sua Aura presa a um permanente do oponente conta; o permanente do oponente não', () => {
    const tg = setup({ battlefield: [[...SWAMPS, { name: 'Mire Blight', attachTo: 'Viscera Seer' }], ['Viscera Seer']], hand: [[NOME], []] });
    expect(tg.state.objects[tg.bf('Mire Blight')].attachedTo).toBe(tg.bf('Viscera Seer'));
    tg.cast(NOME).resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
  });

  it('devoção contada na resolução; sem o Merchant no campo, ele não conta', () => {
    const tg = setup({ battlefield: [[...SWAMPS, 'Viscera Seer'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    expect(tg.state.zones.stack.length).toBe(1); // gatilho de entrar na pilha
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(0)).toBe(41);
  });
});
