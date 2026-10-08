import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Vengeful Dead', () => {
  it('quando ela morre, cada oponente perde 1 de vida', () => {
    const tg = setup({ players: 3, battlefield: [['Vengeful Dead'], [], []] });
    tg.run(destroy(tg.g, [tg.bf('Vengeful Dead')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
  });
  it('Zombie de qualquer jogador morre: dispara; não Zombie não', () => {
    const tg = setup({ players: 3, battlefield: [['Vengeful Dead', 'Wall of Omens'], [{ name: 'Zombie 2/2', token: true }], []], library: [['Island'], [], []] });
    tg.run(destroy(tg.g, [tg.bf('Zombie 2/2'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([40, 39, 39]);
  });
  it('CR 603.10a: morrendo junto com outro Zombie, dispara pelos dois', () => {
    const tg = setup({ battlefield: [['Vengeful Dead', { name: 'Zombie 2/2', token: true }], []] });
    tg.run(destroy(tg.g, [tg.bf('Vengeful Dead'), tg.bf('Zombie 2/2')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });
});
