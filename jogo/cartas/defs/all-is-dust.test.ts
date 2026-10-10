import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "All Is Dust";
describe(N, () => {
  it("sacrifício simultâneo ignora indestrutível e preserva permanentes e fichas incolores", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring', 'Island', 'Darksteel Citadel'], ['Zetalpa, Primal Dawn', { name: 'Phyrexian Germ', token: true, counters: { '+1/+1': 1 } }, { name: 'Thopter', token: true }]], hand: [[N], []] });
    tg.cast(N).resolveAll(); expect(tg.find('Zetalpa, Primal Dawn', 'graveyard')).not.toBeNull(); expect(tg.all('Thopter')).toHaveLength(1);
    expect(tg.all('Phyrexian Germ')).toHaveLength(0); expect(tg.find('Island')).not.toBeNull(); expect(tg.find('Darksteel Citadel')).not.toBeNull();
  });
});
