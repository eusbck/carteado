import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Prognostic Sphinx', () => {
  it('descartar uma carta dá resistência a magia e vira a criatura; dá para ativar com ela já virada', () => {
    const tg = setup({ battlefield: [['Prognostic Sphinx'], []], hand: [['Island', 'Forest'], []] });
    tg.choose('Descart', ['Island']);
    tg.activate('Prognostic Sphinx').resolve();
    const id = tg.bf('Prognostic Sphinx');
    expect(hasKw(tg.g, id, 'hexproof')).toBe(true);
    expect(tg.state.objects[id].tapped).toBe(true);
    // virada, ainda pode ativar
    tg.activate('Prognostic Sphinx').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    tg.passTo('cleanup');
    expect(hasKw(tg.g, id, 'hexproof')).toBe(false);
  });

  it('ao atacar, faz vidência 3', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Prognostic Sphinx'], []], library: [['Island', 'Forest', 'Swamp', 'Plains'], []] });
    tg.script.push((d) => (d.kind === 'arrange' && d.prompt.includes('Vidência 3')
      ? { kind: 'arrange', order: [...d.items].reverse().map((i) => i.id), placement: Object.fromEntries(d.items.map((i) => [i.id, 'top'])) }
      : null));
    tg.attack([['Prognostic Sphinx', 1]]).passTo('declareAttackers');
    tg.resolve();
    expect(tg.names(0, 'library')).toEqual(['Swamp', 'Forest', 'Island', 'Plains']);
  });
});
