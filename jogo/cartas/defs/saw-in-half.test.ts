import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Saw in Half';
const MANA = ['Swamp', 'Swamp', 'Swamp'];

describe(NOME, () => {
  it('destrói uma 2/10 e o controlador dela cria duas cópias 1/5', () => {
    const tg = setup({ battlefield: [MANA, ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    const copias = tg.all('Indomitable Ancients');
    expect(copias.length).toBe(2);
    for (const id of copias) {
      expect(tg.state.objects[id].controller).toBe(1);
      expect(tg.state.objects[id].isToken).toBe(true);
      expect(tg.pt(id)).toEqual([1, 5]);
    }
  });

  it('com marcadores, a metade é da força e da resistência dela no campo, arredondada para cima', () => {
    const tg = setup({ battlefield: [MANA, [{ name: 'Wall of Omens', counters: { '+1/+1': 1 } }]], hand: [[NOME], []], library: [[], ['Island', 'Island', 'Island']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast(NOME).resolveAll();
    const copias = tg.all('Wall of Omens');
    expect(copias.length).toBe(2);
    // 1/5 na hora: 1/3 cada
    expect(tg.pt(copias[0])).toEqual([1, 3]);
  });

  it('indestrutível não morre e ninguém cria fichas', () => {
    const tg = setup({ battlefield: [MANA, ['Zetalpa, Primal Dawn']], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast(NOME).resolve();
    expect(tg.all('Zetalpa, Primal Dawn').length).toBe(1);
  });
});
