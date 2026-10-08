import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Dina, Soul Steeper', () => {
  it('dispara uma vez por evento, qualquer que seja a quantidade; cada oponente perde só 1', () => {
    const tg = setup({ players: 3, battlefield: [['Dina, Soul Steeper'], [], []] });
    gainLife(tg.g, 0, 5, null);
    tg.refresh().resolve();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([45, 39, 39]);
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('X é a força da criatura no campo', () => {
    const tg = setup({ battlefield: [['Dina, Soul Steeper', { name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }, 'Plains'], []] });
    tg.activate('Dina, Soul Steeper').resolve();
    expect(tg.pt(tg.bf('Dina, Soul Steeper'))).toEqual([5, 3]);
    tg.passTo('cleanup');
    expect(tg.pt(tg.bf('Dina, Soul Steeper'))).toEqual([1, 3]);
  });
});
