import { describe, expect, it } from 'vitest';
import { becomeMonarch } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Spear of Bashenga';

describe(N, () => {
  it('entrando sem monarca, você vira o monarca; com monarca, não', () => {
    const tg = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.monarch).toBe(0);
    const outro = setup({ battlefield: [Array(5).fill('Plains'), []], hand: [[N], []] });
    becomeMonarch(outro.g, 1);
    outro.refresh();
    outro.cast(N).resolveAll();
    expect(outro.state.monarch).toBe(1);
  });

  it('a equipada recebe +2/+2 e vigilância; atacando o monarca, destrói uma permanente virada, que não é terreno, dele', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }], [{ name: 'Sol Ring', tapped: true }, 'Darksteel Ingot', { name: 'Island', tapped: true }]] });
    becomeMonarch(tg.g, 1);
    tg.refresh();
    const myr = tg.bf('Silver Myr');
    expect(tg.pt(myr)).toEqual([3, 3]);
    expect(hasKw(tg.g, myr, 'vigilance')).toBe(true);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente virada alvo')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Sol Ring']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([['Silver Myr', 1]]).passTo('declareBlockers');
    expect(tg.find('Sol Ring')).toBeNull();
  });
});