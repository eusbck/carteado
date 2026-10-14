import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Poison-Tip Archer';

describe(NOME, () => {
  it('outra criatura morre: cada oponente perde 1 de vida', () => {
    const tg = setup({ players: 3, battlefield: [[NOME], ['Wall of Omens'], []] });
    expect(hasKw(tg.g, tg.bf(NOME), 'reach')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
  });

  it('morre junto com outra criatura: cada oponente perde 1 de vida por ela', () => {
    const tg = setup({ battlefield: [[NOME], ['Wall of Omens']] });
    tg.run(destroy(tg.g, [tg.bf(NOME), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
});
