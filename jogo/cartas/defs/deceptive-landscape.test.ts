import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Deceptive Landscape', () => {
  it('busca Plains, Swamp ou Forest básica para o campo, virada (e não Island)', () => {
    const tg = setup({ battlefield: [['Deceptive Landscape'], []], library: [['Island', 'Forest'], []] });
    let labels: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Plains, Swamp ou Forest')) return null;
      labels = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Forest')!.id] };
    });
    tg.activate('Deceptive Landscape', 'Sacrifique').resolve();
    expect(labels).toEqual(['Forest']);
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
  });
  it('CR 702.29: ciclagem {W}{B}{G}', () => {
    const tg = setup({ battlefield: [['Plains', 'Swamp', 'Forest'], []], hand: [['Deceptive Landscape'], []], library: [['Island'], []] });
    tg.activate('Deceptive Landscape', 'Ciclagem').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
});
