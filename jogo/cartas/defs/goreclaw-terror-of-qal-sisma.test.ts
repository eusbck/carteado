import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Goreclaw, Terror of Qal Sisma';

describe(N, () => {
  it('criatura de força 4 ou mais custa {2} a menos; de força menor, não', () => {
    // Ripjaw Raptor {2}{G}{G} (4/5) sai por {G}{G}
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Ripjaw Raptor', 'Scavenging Ooze'], []] });
    expect(tg.canCast('Ripjaw Raptor')).toBe(true);
    tg.cast('Ripjaw Raptor').resolve();
    expect(tg.find('Ripjaw Raptor')).not.toBeNull();
    // Scavenging Ooze {1}{G} (2/2) não fica mais barata
    const t2 = setup({ battlefield: [[N, 'Forest'], []], hand: [['Scavenging Ooze'], []] });
    expect(t2.canCast('Scavenging Ooze')).toBe(false);
  });

  it('ao atacar, as criaturas com força 4 ou mais recebem +1/+1 e atropelar', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor', 'Indomitable Ancients'], []] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    const r = tg.bf('Ripjaw Raptor');
    expect(tg.pt(r)).toEqual([5, 6]);
    expect(hasKw(tg.g, r, 'trample')).toBe(true);
    expect(tg.pt(tg.bf(N))).toEqual([5, 4]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
  });
});
