import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/actions.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Rocco, Cabaretti Caterer';

describe(N, () => {
  it('conjurado com X = 3, busca uma criatura de valor 3 ou menos para o campo', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Mountain', 'Plains', 'Forest'], []],
      hand: [[N], []],
      library: [['Elvish Archdruid', 'Woodland Bellower'], []],
    });
    let opcoes: string[] = [];
    tg.number('X', 3).yes('Rocco', true);
    tg.script.push((d) => {
      if (d.kind === 'select' && d.prompt.includes('Rocco: procure')) {
        opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
        return { kind: 'select', ids: [d.items.find((i) => i.label.includes('Elvish Archdruid'))!.id] };
      }
      return null;
    });
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.find('Elvish Archdruid')).not.toBeNull();
    expect(opcoes.some((l) => l.includes('Woodland Bellower'))).toBe(false);
  });
  it('posto no campo sem ser conjurado, não dispara', () => {
    const tg = setup({ battlefield: [[], []], hand: [[N], []], library: [['Elvish Archdruid'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(N, 'hand')!, controller: 0 }], 'effect'));
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(0);
  });
});
