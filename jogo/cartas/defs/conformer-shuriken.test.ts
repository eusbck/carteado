import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Conformer Shuriken';

describe(C, () => {
  it('ao atacar, vira a criatura do defensor e ganha a diferença de força em marcadores', () => {
    const tg = setup({ battlefield: [[{ name: C, attachTo: 'Elvish Mystic' }, { name: 'Elvish Mystic', ready: true }], ["Archon of Sun's Grace"]], step: 'main1' });
    tg.choose('jogador defensor', ["Archon of Sun's Grace"]);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf("Archon of Sun's Grace")].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(2);
  });
});
