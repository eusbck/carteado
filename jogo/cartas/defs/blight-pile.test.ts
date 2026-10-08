import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Blight Pile', () => {
  it('cada oponente perde X, X = criaturas com defensor que você controla', () => {
    const tg = setup({ players: 3, battlefield: [['Blight Pile', 'Wall of Omens', 'Sylvan Caryatid', 'Elvish Mystic', 'Swamp', 'Swamp', 'Swamp'], [], []] });
    tg.activate('Blight Pile').resolve();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 37, 37]);
  });
  it('não pode atacar e o {T} sofre enjoo de invocação', () => {
    const tg = setup({ battlefield: [[{ name: 'Blight Pile', ready: false }, 'Swamp', 'Swamp', 'Swamp'], []] });
    expect(tg.pending!.kind === 'priority' && tg.pending!.actions.some((a) => a.id.startsWith('act:'))).toBe(false);
  });
});
