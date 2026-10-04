import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fracture', () => {
  it('destrói artefato, encantamento ou planeswalker alvo; não criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp'], ['Sol Ring', 'Wall of Omens']], hand: [['Fracture'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato, encantamento')) return null;
      labels = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast('Fracture').resolve();
    expect(labels).toEqual(['Sol Ring']);
    expect(tg.find('Sol Ring')).toBeNull();
  });
});
