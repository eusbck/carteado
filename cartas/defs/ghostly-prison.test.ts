import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Ghostly Prison', () => {
  it('cobra {2} por criatura atacando você', () => {
    const tg = setup({ active: 1, battlefield: [['Ghostly Prison'], ['Elvish Mystic', 'Forest', 'Forest']], library: [['Island'], ['Island']] });
    tg.attack([['Elvish Mystic', 0]]).passTo('main2');
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Forest').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
  it('sem mana para pagar, a criatura não pode atacar você', () => {
    const tg = setup({ active: 1, battlefield: [['Ghostly Prison'], ['Elvish Mystic']], library: [['Island'], ['Island']] });
    let pediu = false;
    tg.script.push((d) => {
      if (d.kind !== 'payment') return null;
      pediu = d.canCancel;
      return { kind: 'payment', cancel: true };
    });
    tg.attack([['Elvish Mystic', 0]]);
    tg.script.push((d) => (d.kind === 'attackers' ? { kind: 'attackers', attacks: [] } : null));
    tg.passTo('main2');
    expect(pediu).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
});
