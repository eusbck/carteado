import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Steelshaper's Gift";

describe(N, () => {
  it('busca uma carta de Equipamento para a mão', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[N], []], library: [['Island', "Hero's Blade", 'Sol Ring'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Equipamento')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      expect(ativos.map((i) => i.label)).toEqual(["Hero's Blade"]);
      return { kind: 'select', ids: [ativos[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(["Hero's Blade"]);
  });
});