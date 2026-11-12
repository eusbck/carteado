import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Collected Company';

describe(N, () => {
  it('cada criatura pode ter valor de mana 3 ou menos; não é a soma', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []],
      library: [['Wall of Omens', 'Island', 'Zetalpa, Primal Dawn', 'Elvish Mystic', 'Llanowar Elves', 'Swamp', 'Plains'], []],
    });
    let zetalpaLivre = true;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !/até duas/.test(d.prompt)) return null;
      zetalpaLivre = d.items.some((i) => i.label.includes('Zetalpa') && !i.disabled);
      expect(d.items.map((i) => i.label)).not.toContain('Plains'); // só as seis do topo
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Wall of Omens' || i.label === 'Llanowar Elves').map((i) => i.id) };
    });
    tg.cast(N).resolve();
    expect(zetalpaLivre).toBe(false);
    expect(tg.bf('Wall of Omens')).toBeTruthy();
    expect(tg.bf('Llanowar Elves')).toBeTruthy();
    // o resto (4) vai para o fundo, abaixo da Plains
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Plains');
    expect(lib.slice(1).sort()).toEqual(['Elvish Mystic', 'Island', 'Swamp', 'Zetalpa, Primal Dawn']);
  });
});
