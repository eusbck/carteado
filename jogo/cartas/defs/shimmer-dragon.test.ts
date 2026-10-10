import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Shimmer Dragon";
describe(N, () => {
  it("resistência a magia é condicional; vira artefatos recém-criados para comprar", () => {

    const tg = setup({ battlefield: [[N, ...Array.from({ length: 4 }, () => ({ name: 'Myr', token: true, ready: false }))], []] });
    expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(true); tg.choose('Vire', ['Myr', 'Myr']).activate(N).resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1); expect(tg.all('Myr').filter(id => tg.state.objects[id].tapped)).toHaveLength(2);
    removeCard(tg, tg.all('Myr')[0]); expect(hasKw(tg.g, tg.bf(N), 'hexproof')).toBe(false);
  });
});
