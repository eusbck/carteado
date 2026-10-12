import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Plasmancer';

describe(N, () => {
  it('voar; ao entrar busca um Swamp básico para a mão', () => {
    const tg = setup({ battlefield: [Array(4).fill('Swamp'), []], hand: [[N], []], library: [['Island', 'Swamp', 'Sol Ring'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Swamp básico')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      expect(ativos.map((i) => i.label)).toEqual(['Swamp']);
      return { kind: 'select', ids: [ativos[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.names(0, 'hand')).toEqual(['Swamp']);
  });
});