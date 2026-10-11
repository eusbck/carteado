import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = "White Sun's Zenith";

describe(N, () => {
  it('cria X Cats 2/2 e é embaralhada no grimório do dono; anulada, vai para o cemitério', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains')], []], hand: [[N], []], library: [Array(3).fill('Forest'), []] });
    tg.number('valor de X', 3).cast(N).resolveAll();
    const gatos = tg.all('Cat');
    expect(gatos).toHaveLength(3);
    expect(tg.pt(gatos[0])).toEqual([2, 2]);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Forest', 'Forest', N].sort());

    const anulada = setup({ battlefield: [[...Array(6).fill('Plains')], []], hand: [[N], []], library: [Array(3).fill('Forest'), []] });
    anulada.number('valor de X', 3).cast(N);
    anulada.run(counter(anulada.g, anulada.state.zones.stack[0]));
    anulada.resolveAll();
    expect(anulada.all('Cat')).toHaveLength(0);
    expect(anulada.names(0, 'graveyard')).toEqual([N]);
  });
});
