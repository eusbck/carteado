import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Beacon of Unrest';

describe(N, () => {
  it('põe no campo sob o seu controle um artefato ou criatura de qualquer cemitério e é embaralhada no grimório', () => {
    const tg = setup({ battlefield: [Array(5).fill('Swamp'), []], hand: [[N], []], graveyard: [[], ['Serra Angel', 'Island']], library: [['Island'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('num cemitério')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Serra Angel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(controllerOf(tg.g, tg.bf('Serra Angel'))).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library')).toContain(N);
  });
});