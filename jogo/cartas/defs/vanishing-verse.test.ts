import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Vanishing Verse', () => {
  it('incolores e multicoloridos não são alvos', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp'], ['Wall of Omens', 'Sol Ring', 'Killian, Ink Duelist']], hand: [['Vanishing Verse'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('monocolorido')) return null;
      labels = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast('Vanishing Verse').resolve();
    expect(labels).toEqual(['Wall of Omens']);
    expect(tg.names(1, 'exile')).toEqual(['Wall of Omens']);
  });
});
