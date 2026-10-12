import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Make Your Move';

describe(N, () => {
  it('destrói um artefato, um encantamento ou uma criatura com força 4 ou mais', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Serra Angel', 'Elvish Mystic', 'Sol Ring', 'High Score']], hand: [[N], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('força 4 ou mais')) return null;
      expect(d.items.map((i) => i.label).sort()).toEqual(['High Score', 'Serra Angel', 'Sol Ring']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Serra Angel')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Serra Angel')).toBeNull();
  });
});