import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const W = "Wayfarer's Bauble";

describe(W, () => {
  it('{2}, {T}, sacrifique: um terreno básico do grimório entra virado', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', W], []], library: [['Cinder Glade', 'Plains'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('terreno básico')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Plains')!.id] };
    });
    tg.activate(W);
    expect(tg.names(0, 'graveyard')).toEqual([W]);
    tg.resolve();
    expect(opcoes).toEqual(['Plains']);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
  it('sem {2} disponível, não ativa', () => {
    const tg = setup({ battlefield: [['Mountain', W], []], library: [['Plains'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});
