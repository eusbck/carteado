import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Umbral Collar Zealot', () => {
  it('sacrifique outra criatura ou artefato: vigiar 1', () => {
    const tg = setup({ battlefield: [['Umbral Collar Zealot', 'Sol Ring', 'Plains'], []], library: [['Island', 'Plains'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Sacrifique')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: { [d.items[0].id]: 'graveyard' } } : null));
    tg.activate('Umbral Collar Zealot').resolve();
    expect(opcoes).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Sol Ring']);
  });
});
