import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bladewing the Risen';
const terrenos = ['Swamp', 'Swamp', 'Swamp', 'Mountain', 'Mountain', 'Mountain', 'Mountain', 'Swamp', 'Mountain'];

describe(N, () => {
  it('voar; quando entra, pode devolver ao campo uma carta de permanente Dragon do seu cemitério', () => {
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], graveyard: [['Furnace Whelp', 'Serra Angel'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Dragon alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Furnace Whelp']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.find('Furnace Whelp')).not.toBeNull();
    // {B}{R}: os Dragons recebem +1/+1
    tg.activate(N).resolveAll();
    expect(tg.pt(id)).toEqual([5, 5]);
    expect(tg.pt(tg.bf('Furnace Whelp'))).toEqual([3, 3]);
  });
});