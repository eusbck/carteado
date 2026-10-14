import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = "Garruk's Packleader";

describe(N, () => {
  it('outra criatura com força 3 ou mais entra: você pode comprar uma carta; com força 2, não dispara', () => {
    const tg = fixture({ battlefield: [[N], []] });
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(0);
    tg.yes('Packleader', true);
    enterCard(tg, 'Ripjaw Raptor', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
    tg.yes('Packleader', false);
    enterCard(tg, 'Ripjaw Raptor', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
