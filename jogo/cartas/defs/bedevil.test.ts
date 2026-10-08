import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Bedevil', () => {
  it('destrói artefato, criatura ou planeswalker alvo (não terreno)', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Mountain'], ['Sol Ring', 'Command Tower']], hand: [['Bedevil'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato, criatura')) return null;
      labels = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.cast('Bedevil').resolve();
    expect(labels).not.toContain('Command Tower');
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
