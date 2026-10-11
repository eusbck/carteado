import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Healing Technique';

describe(N, () => {
  it('devolve a carta alvo do seu cemitério para a mão, você ganha vida igual ao valor de mana dela, e a mágica é exilada', () => {
    // Indomitable Ancients tem valor de mana 4
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []], graveyard: [['Indomitable Ancients'], ['Sol Ring']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta alvo do seu cemitério')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Indomitable Ancients']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.yes('Demonstrar', false);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.life(0)).toBe(44);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});