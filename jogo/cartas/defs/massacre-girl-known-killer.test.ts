import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Massacre Girl, Known Killer', () => {
  it('dano de combate das suas criaturas vira marcadores; criatura com resistência 0 por marcadores faz comprar', () => {
    const tg = setup({ battlefield: [['Massacre Girl, Known Killer', 'Gau, Feral Youth'], ['Elvish Mystic', 'Wall of Omens']], library: [['Island', 'Island'], ['Island']] });
    tg.script.push((d) => (d.kind === 'blockers' ? { kind: 'blockers', blocks: [[tg.bf('Elvish Mystic'), tg.bf('Gau, Feral Youth')]] } : null));
    tg.attack([['Gau, Feral Youth', 1]]).passTo('main2');
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('morte com resistência positiva não faz comprar', () => {
    const tg = setup({ battlefield: [['Massacre Girl, Known Killer'], ['Wall of Omens']], library: [['Island'], ['Island']] });
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});
