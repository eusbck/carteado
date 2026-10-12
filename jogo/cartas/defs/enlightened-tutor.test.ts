import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Enlightened Tutor';

describe(N, () => {
  it('busca um artefato ou encantamento, embaralha e põe a carta no topo do grimório', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[N], []], library: [['Island', 'Island', 'Elvish Mystic', 'Sol Ring', 'Island'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato ou de encantamento')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      expect(ativos.map((i) => i.label)).toEqual(['Sol Ring']);
      return { kind: 'select', ids: [ativos[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'library')[0]).toBe('Sol Ring');
    expect(tg.names(0, 'library')).toHaveLength(5);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});