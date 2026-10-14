import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Colossal Majesty';

describe(N, () => {
  it('na sua manutenção, com uma criatura de força 4 ou mais, compra uma carta só', () => {
    const tg = fixture({ battlefield: [[N, 'Zetalpa, Primal Dawn', 'Zetalpa, Primal Dawn'], []] });
    tg.passTo('upkeep', 0);
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('sem criatura com força 4 ou mais, não dispara', () => {
    const tg = fixture({ battlefield: [[N, 'Indomitable Ancients'], []] });
    tg.passTo('upkeep', 0);
    expect(tg.state.zones.hand[0]).toHaveLength(0);
  });
});
