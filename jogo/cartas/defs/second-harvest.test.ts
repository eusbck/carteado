import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Second Harvest';

describe(NOME, () => {
  it('copia cada ficha que você controla, sem os marcadores e desvirada', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', { name: 'Squirrel', token: true, tapped: true, counters: { '+1/+1': 2 } }, { name: 'Food', token: true }], [{ name: 'Food', token: true }]],
      hand: [[NOME], []],
    });
    tg.cast(NOME).resolve();
    const esquilos = tg.all('Squirrel');
    expect(esquilos.length).toBe(2);
    const nova = esquilos.find((id) => !tg.state.objects[id].tapped)!;
    expect(tg.state.objects[nova].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.pt(nova)).toEqual([1, 1]);
    expect(tg.all('Food').filter((id) => tg.state.objects[id].controller === 0).length).toBe(2);
    expect(tg.all('Food').filter((id) => tg.state.objects[id].controller === 1).length).toBe(1);
  });
});
