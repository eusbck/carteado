import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Sphere of Safety', () => {
  it('cobra {X} por criatura atacando você, onde X é o número de encantamentos que você controla', () => {
    // Sphere e Ghostly Prison: dois encantamentos; Ghostly Prison cobra mais {2}: {4} ao todo
    const tg = setup({ active: 1, battlefield: [['Sphere of Safety', 'Ghostly Prison'], ['Elvish Mystic', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest']], library: [['Island'], ['Island']] });
    tg.attack([['Elvish Mystic', 0]]).passTo('main2');
    expect(tg.life(0)).toBe(39);
    expect(tg.all('Forest').filter((id) => tg.state.objects[id].tapped)).toHaveLength(4);
  });

  it('sem mana para pagar, a criatura não pode atacar você', () => {
    const tg = setup({ active: 1, battlefield: [['Sphere of Safety'], ['Elvish Mystic']], library: [['Island'], ['Island']] });
    let pediu = false;
    tg.script.push((d) => {
      if (d.kind !== 'payment') return null;
      pediu = true;
      return { kind: 'payment', cancel: true };
    });
    tg.attack([['Elvish Mystic', 0]]);
    tg.script.push((d) => (d.kind === 'attackers' ? { kind: 'attackers', attacks: [] } : null));
    tg.passTo('main2');
    expect(pediu).toBe(true);
    expect(tg.life(0)).toBe(40);
  });
});
