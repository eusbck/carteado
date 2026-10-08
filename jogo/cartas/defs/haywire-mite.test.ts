import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Haywire Mite', () => {
  it('sacrifique: exila artefato ou encantamento não criatura; ao morrer, ganha 2', () => {
    const tg = setup({ battlefield: [['Haywire Mite', 'Forest'], ['Sol Ring', 'Millikin', 'Bastion of Remembrance']] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('não criatura')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.activate('Haywire Mite').resolveAll();
    expect(opcoes).toEqual(['Bastion of Remembrance', 'Sol Ring']);
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
    expect(tg.life(0)).toBe(42);
  });
});
