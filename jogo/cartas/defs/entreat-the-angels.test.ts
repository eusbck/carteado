import { describe, expect, it } from 'vitest';
import { manaValue } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const planicies = (n: number) => Array(n).fill('Plains');

describe('Entreat the Angels', () => {
  it('pelo milagre com X = 2 paga {2}{W}{W}, cria dois Angels e o valor de mana na pilha é 7', () => {
    const tg = setup({ step: 'upkeep', battlefield: [planicies(4), []], library: [['Entreat the Angels', 'Island'], ['Forest']] });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true).number('valor de X', 2);
    tg.passUntil((t) => t.find('Entreat the Angels', 'stack') !== null);
    const id = tg.find('Entreat the Angels', 'stack')!;
    expect(manaValue(tg.g, id)).toBe(7);
    expect(tg.state.zones.battlefield.filter((x) => tg.state.objects[x].def === 'Plains' && tg.state.objects[x].tapped)).toHaveLength(4);
    tg.resolve();
    const anjos = tg.all('Angel');
    expect(anjos).toHaveLength(2);
    expect(tg.pt(anjos[0])).toEqual([4, 4]);
  });

  it('pelo custo normal com X = 1 paga {2}{W}{W}{W} e cria um Angel', () => {
    const tg = setup({ battlefield: [planicies(5), []], hand: [['Entreat the Angels'], []] });
    tg.number('valor de X', 1).cast('Entreat the Angels').resolve();
    expect(tg.all('Angel')).toHaveLength(1);
    expect(tg.state.zones.battlefield.filter((x) => tg.state.objects[x].def === 'Plains' && !tg.state.objects[x].tapped)).toHaveLength(0);
  });
});
