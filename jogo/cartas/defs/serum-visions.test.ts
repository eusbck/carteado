import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Serum Visions', () => {
  it('compra uma carta e depois faz vidência 2 com as seguintes', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Serum Visions'], []], library: [['Plains', 'Swamp', 'Forest', 'Mountain'], []] });
    let vistas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'arrange') return null;
      vistas = d.items.map((i) => i.label);
      return { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) };
    });
    tg.cast('Serum Visions').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(vistas).toEqual(['Swamp', 'Forest']);
    expect(tg.names(0, 'library')).toEqual(['Mountain', 'Swamp', 'Forest']);
  });
});
