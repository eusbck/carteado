import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Elemental Bond';

describe(N, () => {
  it('criatura que entra com força 3 ou mais compra uma carta; com força 2, não', () => {
    const tg = fixture({ battlefield: [[N], []] });
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(0);
    enterCard(tg, 'Ripjaw Raptor', 0);
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
