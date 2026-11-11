import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Blackblade Reforged';

describe(N, () => {
  it('a equipada recebe +1/+1 para cada terreno que você controla', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }, 'Plains', 'Forest', 'Mountain'], ['Island']] });
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
  });

  it('CR 702.6c — equipar criatura lendária {3} só mira criatura lendária; equipar {7} mira qualquer uma sua', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Wyleth, Soul of Steel', 'Plains', 'Plains', 'Plains'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura lendária alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Wyleth, Soul of Steel']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N, 'lendária').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Wyleth, Soul of Steel'));
    // com só três terrenos, o equipar {7} não está disponível
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.includes('Equipar {7}'))).toBe(false);
  });
});
