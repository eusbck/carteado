import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const F = 'Farseek';

describe(F, () => {
  it('procura Plains, Island, Swamp ou Mountain e a coloca no campo virada', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[F], []], library: [['Forest', 'Island', 'Swamp'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Procure')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Island')!.id] };
    });
    tg.cast(F).resolve();
    expect(opcoes).toEqual(['Island', 'Swamp']);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Swamp']);
  });
  it('acha terreno não básico com um dos tipos, mesmo sendo também Forest', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[F], []], library: [['Cinder Glade'], []] });
    tg.choose('Procure', ['Cinder Glade']);
    tg.cast(F).resolveAll();
    expect(tg.state.objects[tg.bf('Cinder Glade')].tapped).toBe(true);
  });
});
