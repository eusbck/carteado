import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Mortify', () => {
  it('destrói criatura ou encantamento alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Sol Ring'], ['Wall of Omens', { name: 'Angelic Gift', attachTo: 'Wall of Omens' }, 'Sol Ring']], hand: [['Mortify'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura ou encantamento')) return null;
      labels = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Angelic Gift')!.id] };
    });
    tg.cast('Mortify').resolve();
    expect(labels).toEqual(['Angelic Gift', 'Wall of Omens']);
    expect(tg.find('Angelic Gift')).toBeNull();
  });
});
