import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { blockCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Brotherhood Regalia';

describe(N, () => {
  it('a equipada tem resguardo {2}, é Assassin e não pode ser bloqueada', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }], ['Indomitable Ancients']], step: 'beginCombat' });
    const myr = tg.bf('Silver Myr');
    expect(hasKw(tg.g, myr, 'ward')).toBe(true);
    expect(chars(tg.g, myr).subtypes).toContain('Assassin');
    expect(chars(tg.g, myr).subtypes).toContain('Myr');
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(blockCandidates(tg.g, 1)).toEqual([]);
  });

  it('CR 702.6c — equipar criatura lendária {1} só mira criatura lendária; equipar {3} mira qualquer uma sua', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Wyleth, Soul of Steel', 'Plains'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Wyleth, Soul of Steel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'lendária').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Wyleth, Soul of Steel'));
  });
});
