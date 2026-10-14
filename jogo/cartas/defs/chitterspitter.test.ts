import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Chitterspitter';

describe(NOME, () => {
  it('na manutenção, sacrifica uma ficha e ganha um marcador de bolota; os Squirrels recebem +1/+1 por marcador', () => {
    const tg = setup({ step: 'untap', battlefield: [[NOME, { name: 'Food', token: true }, { name: 'Squirrel', token: true }], []], library: [['Island'], []] });
    tg.choose('Chitterspitter', ['Food']);
    tg.passTo('main1');
    expect(tg.state.objects[tg.bf(NOME)].counters.acorn).toBe(1);
    expect(tg.all('Food')).toEqual([]);
    expect(tg.pt(tg.bf('Squirrel'))).toEqual([2, 2]);
  });

  it('{G}, {T}: cria um Squirrel', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { acorn: 2 } }, 'Forest'], []] });
    tg.activate(NOME, 'Squirrel').resolve();
    expect(tg.pt(tg.bf('Squirrel'))).toEqual([3, 3]);
  });
});
