import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Kotori, Pilot Prodigy';
const V = "Cultivator's Caravan";

describe(N, () => {
  it('os seus Veículos têm tripular 2: uma criatura de força 2 tripula o Caravan (tripular 3)', () => {
    const tg = fixture({ battlefield: [[N, V, 'Indomitable Ancients'], []] });
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['done']).activate(V, 'Tripular 2').resolveAll();
    expect(chars(tg.g, tg.bf(V)).types).toContain('Creature');
    const sem = fixture({ battlefield: [[V, 'Indomitable Ancients'], []] });
    expect(() => sem.activate(V, 'Tripular 2')).toThrow();
  });

  it('no início do seu combate, a criatura artefato alvo ganha vínculo com a vida e vigilância', () => {
    const tg = fixture({ battlefield: [[N, 'Silver Myr'], []] });
    tg.choose('criatura artefato alvo', ['Silver Myr']).passTo('beginCombat');
    const m = tg.bf('Silver Myr');
    expect(hasKw(tg.g, m, 'lifelink')).toBe(true);
    expect(hasKw(tg.g, m, 'vigilance')).toBe(true);
    tg.attack([['Silver Myr', 1]]).passTo('main2');
    expect(tg.life(0)).toBe(41);
    expect(tg.state.objects[m].tapped).toBe(false);
  });
});
