import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Price of Fame';

describe(N, () => {
  it('mirando uma criatura lendária custa {1}{B}; destrói e vigia 2', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Satoru, the Infiltrator', 'Indomitable Ancients']], hand: [[N], []], library: [['Forest', 'Island', 'Plains'], []] });
    tg.choose('criatura alvo', ['Satoru, the Infiltrator']);
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])), order: d.items.map((i) => i.id) } : null));
    tg.cast(N).resolve();
    expect(tg.find('Satoru, the Infiltrator')).toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', N]);
  });
  it('sem lendária para mirar, custa {3}{B}', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
});
