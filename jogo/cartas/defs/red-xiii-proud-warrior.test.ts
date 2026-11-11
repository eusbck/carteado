import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const C = 'Red XIII, Proud Warrior';

describe(C, () => {
  it('ruling 1 e 3: equipada (por quem for) ou com marcador conta como modificada', () => {
    const tg = setup({ battlefield: [[C, { name: 'Basilisk Collar', attachTo: 'Elvish Mystic' }, 'Elvish Mystic', { name: 'Wall of Omens', counters: { '+1/+1': 1 } }, 'Dina, Essence Brewer'], []] });
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'trample')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'vigilance')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Dina, Essence Brewer'), 'trample')).toBe(false);
  });
  it('Memória do Cosmo: devolve um Equipamento do cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Mountain', 'Forest', 'Forest'], []], hand: [[C], []], graveyard: [['Basilisk Collar', 'Opt'], []] });
    tg.choose('Aura ou Equipamento', ['Basilisk Collar']);
    tg.cast(C).resolveAll();
    expect(tg.names(0, 'hand')).toContain('Basilisk Collar');
  });
});
