import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Tevesh Szat, Doom of Fools';

describe(NOME, () => {
  it('+2 cria duas fichas Thrull 0/1', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.activate(NOME, '+2').resolve();
    const t = tg.all('Thrull');
    expect(t).toHaveLength(2);
    expect(tg.pt(t[0])).toEqual([0, 1]);
  });

  it('+1 sacrificando um comandante compra três cartas', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Indomitable Ancients', commander: true }], []], library: [['Island', 'Island', 'Island', 'Island'], []] });
    tg.yes('sacrificar outra criatura').choose('sacrifique outra criatura', ['Indomitable Ancients']);
    tg.activate(NOME, '+1').resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
  });

  it('−10 ganha os comandantes do campo e põe os da zona de comando sob o seu controle', () => {
    const tg = setup({
      battlefield: [[{ name: NOME, counters: { loyalty: 10 } }], [{ name: 'Indomitable Ancients', commander: true }]],
      command: [[], ['Wall of Omens']], library: [['Island'], ['Island']],
    });
    tg.activate(NOME, '−10').resolveAll();
    expect(controllerOf(tg.g, tg.bf('Indomitable Ancients'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Wall of Omens'))).toBe(0);
  });
});
