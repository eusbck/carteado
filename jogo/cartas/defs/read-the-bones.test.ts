import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Read the Bones', () => {
  it('vidência 2, compra duas cartas e perde 2 de vida na resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [['Read the Bones'], []], library: [['Island', 'Forest', 'Plains', 'Swamp'], []] });
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vidência 2')
      ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i, k) => [i.id, k === 0 ? 'bottom' : 'top'])) }
      : null));
    tg.cast('Read the Bones');
    expect(tg.life(0)).toBe(40);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Island']);
    expect(tg.life(0)).toBe(38);
  });
});
