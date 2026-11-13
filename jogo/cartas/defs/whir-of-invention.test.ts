import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Whir of Invention';

describe(N, () => {
  it('com X=2, os artefatos virados pagam o {2}, e o {U}{U}{U} vem das Islands', () => {
    // artefatos sem habilidade de mana: Grafdigger's Cage e Cursed Totem
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', "Grafdigger's Cage", 'Cursed Totem'], []], hand: [[N], []], library: [['Sol Ring', 'Thran Dynamo', 'Mind Stone'], []] });
    let servem: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('artefato com valor de mana 2')) return null;
      servem = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Mind Stone')!.id] };
    });
    tg.number('valor de X', 2).cast(N).resolve();
    expect(servem).toEqual(['Mind Stone', 'Sol Ring']);
    expect(tg.find('Mind Stone')).not.toBeNull();
    expect(tg.state.objects[tg.bf("Grafdigger's Cage")].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Cursed Totem')].tapped).toBe(true);
  });
});
