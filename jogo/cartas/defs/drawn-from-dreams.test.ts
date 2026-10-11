import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Drawn from Dreams';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('olha sete cartas, põe duas na mão e o resto no fundo do grimório', () => {
    const topo = ['Plains', 'Sol Ring', 'Swamp', 'Goldspan Dragon', 'Forest', 'Mountain', 'Plains'];
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []], library: [[...topo, 'Elvish Mystic', 'Wall of Omens'], []] });
    let vistas = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      vistas = d.items.length;
      return { kind: 'select', ids: ['Sol Ring', 'Goldspan Dragon'].map((n) => d.items.find((i) => i.label === n)!.id) };
    });
    tg.cast(N).resolveAll();
    expect(vistas).toBe(7);
    expect(tg.names(0, 'hand').sort()).toEqual(['Goldspan Dragon', 'Sol Ring']);
    const lib = tg.names(0, 'library');
    // as duas que não foram olhadas continuam no topo; as cinco restantes foram para o fundo
    expect(lib.slice(0, 2)).toEqual(['Elvish Mystic', 'Wall of Omens']);
    expect(lib.slice(2).sort()).toEqual(['Forest', 'Mountain', 'Plains', 'Plains', 'Swamp']);
  });

  it('com menos de duas cartas no grimório, pega as que houver', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], []], library: [['Sol Ring'], []] });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.state.zones.library[0]).toHaveLength(0);
  });
});
