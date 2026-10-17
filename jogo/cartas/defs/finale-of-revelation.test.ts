import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Finale of Revelation';

describe(N, () => {
  it('compra X cartas e vai para o exílio', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt'], []], library: [Array(5).fill('Plains'), []] });
    tg.number('valor de X', 3).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.names(0, 'exile')).toEqual([N]);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });

  it('com X 10 ou mais: embaralha o cemitério no grimório, compra X, desvira cinco terrenos e fica sem limite de mão', () => {
    const tg = setup({
      battlefield: [Array(12).fill('Island'), []], hand: [[N], []],
      graveyard: [['Opt', 'Serum Visions', 'Forest'], []], library: [Array(9).fill('Plains'), Array(3).fill('Plains')],
    });
    tg.choose('desvire até cinco terrenos', ['Island', 'Island', 'Island', 'Island', 'Island']);
    tg.number('valor de X', 10).cast(N).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'hand')).toHaveLength(10);
    expect(tg.state.zones.library[0]).toHaveLength(2);
    expect(tg.state.zones.battlefield.filter((id) => !tg.state.objects[id].tapped)).toHaveLength(5);
    expect(tg.names(0, 'exile')).toEqual([N]);
    // na limpeza não descarta nada; no turno seguinte também não
    tg.passTo('cleanup');
    expect(tg.names(0, 'hand')).toHaveLength(10);
    tg.passTo('main1', 0);
    tg.passTo('cleanup', 0);
    expect(tg.names(0, 'hand')).toHaveLength(11);
  });
});
