import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife, loseLife } from '../../motor/api.ts';

describe('Indulging Patrician', () => {
  it('conta vida ganha mesmo com perdas maiores no turno', () => {
    const tg = setup({ step: 'main2', players: 3, battlefield: [['Indulging Patrician'], [], []], library: [['Island'], ['Island'], ['Island']] });
    gainLife(tg.g, 0, 3, null);
    loseLife(tg.g, 0, 10, null);
    tg.refresh().passTo('end').resolve();
    expect([tg.life(1), tg.life(2)]).toEqual([37, 37]);
  });
  it('com menos de 3 de vida ganha, não dispara', () => {
    const tg = setup({ step: 'main2', battlefield: [['Indulging Patrician'], []], library: [['Island'], ['Island']] });
    gainLife(tg.g, 0, 2, null);
    tg.refresh().passTo('cleanup');
    expect(tg.life(1)).toBe(40);
  });
});
