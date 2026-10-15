import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Epic Experiment';
const CONJURAR = 'escolha uma mágica para conjurar';

describe(N, () => {
  it('conjura de graça as instantâneas e feitiços com valor de mana X ou menos, e o resto vai para o cemitério', () => {
    const tg = setup({
      battlefield: [['Island', 'Mountain', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []],
      library: [['Opt', 'Think Twice', 'Wall of Omens', "Baral's Expertise", 'Plains', 'Swamp', 'Forest'], []],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes(CONJURAR) || oferecidas.length) return null;
      oferecidas = d.items.map((i) => i.label);
      return null;
    });
    tg.choose(CONJURAR, ['Think Twice']).choose(CONJURAR, ['Opt']);
    tg.number('valor de X', 4).cast(N).resolve();
    // Wall of Omens não é instantânea nem feitiço; Baral's Expertise custa 5
    expect(oferecidas).toEqual(['Não conjurar', 'Opt', 'Think Twice']);
    expect(tg.state.zones.stack.map((id) => tg.state.objects[id].def)).toEqual(['Think Twice', 'Opt']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, "Baral's Expertise", 'Wall of Omens'].sort());
    tg.resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, "Baral's Expertise", 'Opt', 'Think Twice', 'Wall of Omens'].sort());
    expect(tg.names(0, 'exile')).toEqual([]);
  });
});
