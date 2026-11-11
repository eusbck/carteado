import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Open the Armory';

describe(N, () => {
  it('busca uma carta de Aura ou de Equipamento para a mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Island', "Hero's Blade", 'Sol Ring', 'Ethereal Armor'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Aura ou de Equipamento')) return null;
      const ativos = d.items.filter((i) => !(i as { disabled?: boolean }).disabled);
      expect(ativos.map((i) => i.label).sort()).toEqual(['Ethereal Armor', "Hero's Blade"]);
      return { kind: 'select', ids: [ativos.find((i) => i.label === 'Ethereal Armor')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Ethereal Armor']);
  });
});
