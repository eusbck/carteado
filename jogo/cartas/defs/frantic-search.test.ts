import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Frantic Search';

describe(N, () => {
  it('compra duas, descarta duas e desvira até três terrenos escolhidos na resolução, de qualquer jogador', () => {
    const tg = setup({
      battlefield: [['Island', 'Island', 'Island'], [{ name: 'Forest', tapped: true }]],
      hand: [[N, 'Sol Ring'], []], library: [['Plains', 'Swamp', 'Mountain'], []],
    });
    let opcoes = 0;
    tg.choose('Descarte', ['Sol Ring', 'Plains']);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith(N)) return null;
      opcoes = d.items.length;
      // os três que pagaram a mágica
      return { kind: 'select', ids: d.items.filter((i) => i.label.startsWith('Island')).map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    // os três seus e o do oponente estavam virados
    expect(opcoes).toBe(4);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Plains', 'Sol Ring'].sort());
    expect(tg.all('Island').every((id) => !tg.state.objects[id].tapped)).toBe(true);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });

  it('pode desvirar o terreno de outro jogador, ou nenhum', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], [{ name: 'Forest', tapped: true }]], hand: [[N], []], library: [['Plains', 'Swamp', 'Mountain'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith(N) ? { kind: 'select', ids: [d.items.find((i) => i.label.startsWith('Forest'))!.id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(false);
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});
