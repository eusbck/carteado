import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { untap } from '../../motor/api.ts';

describe('Restless Spire', () => {
  it('vira criatura 2/1 com primeiro golpe no seu turno e faz vidência ao atacar', () => {
    const tg = setup({ battlefield: [[{ name: 'Restless Spire', ready: true }, 'Island', 'Mountain'], []], library: [['Plains', 'Island'], ['Island']] });
    tg.activate('Restless Spire', 'Elemental').resolve();
    const sp = tg.bf('Restless Spire');
    untap(tg.g, sp); // o pagamento automático pode ter usado o próprio Spire
    tg.refresh();
    expect(chars(tg.g, sp).types.sort()).toEqual(['Creature', 'Land']);
    expect(tg.pt(sp)).toEqual([2, 1]);
    expect(hasKw(tg.g, sp, 'first strike')).toBe(true);
    let viu = false;
    tg.script.push((d) => (d.kind === 'arrange' ? (viu = true, { kind: 'arrange', placement: Object.fromEntries(d.items.map((i) => [i.id, 'bottom'])), order: d.items.map((i) => i.id) }) : null));
    tg.attack([['Restless Spire', 1]]).passTo('main2');
    expect(viu).toBe(true);
    expect(tg.life(1)).toBe(38);
  });
});
