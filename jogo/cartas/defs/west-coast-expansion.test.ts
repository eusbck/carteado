import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'West Coast Expansion';

describe(N, () => {
  it('compra X cartas; com X 5 ou mais, pode conjurar de graça uma mágica de Hero da mão', () => {
    const tg = setup({ battlefield: [Array(7).fill('Island'), []], hand: [[N, 'Professor Hulk', 'Silver Myr'], []], library: [Array(7).fill('Island'), ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('West Coast Expansion: você pode')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Professor Hulk']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.number('X', 5).yes('Professor Hulk', true).cast(N).resolveAll();
    expect(tg.find('Professor Hulk')).not.toBeNull();
    expect(tg.names(0, 'hand')).toHaveLength(6);
  });

  it('com X menor que 5, só compra', () => {
    const tg = setup({ battlefield: [Array(4).fill('Island'), []], hand: [[N, 'Professor Hulk'], []], library: [Array(4).fill('Island'), ['Island']] });
    tg.number('X', 2).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.find('Professor Hulk')).toBeNull();
  });
});