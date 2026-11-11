import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw, putOntoBattlefield, sacrifice } from '../../motor/api.ts';

const H = 'Hellkite Courser';
const UR = 'The Ur-Dragon';

function comCourser() {
  const tg = setup({ battlefield: [[], []], hand: [[H], []], command: [[{ name: UR, commander: true }], []], library: [Array(3).fill('Island'), Array(3).fill('Island')] });
  tg.choose('comandante seu da zona de comando', [UR]);
  tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(H, 'hand', 0)!, controller: 0 }], 'effect'));
  tg.resolve();
  return tg;
}

describe(H, () => {
  it('põe o comandante no campo com ímpeto sem aumentar o imposto, e ele volta na etapa final', () => {
    const tg = comCourser();
    const ur = tg.bf(UR);
    expect(hasKw(tg.g, ur, 'haste')).toBe(true);
    expect(Object.values(tg.state.players[0].commanderCasts).reduce((a, b) => a + b, 0)).toBe(0);
    tg.passTo('end', 0);
    expect(tg.find(UR, 'command', 0)).not.toBeNull();
    expect(tg.find(UR, 'battlefield', 0)).toBeNull();
  });
  it('se o comandante já saiu do campo, não volta à zona de comando', () => {
    const tg = comCourser();
    tg.run(sacrifice(tg.g, [tg.bf(UR)]));
    // foi para o cemitério (e, se o dono quiser, para a zona de comando pela regra do comandante); o gatilho atrasado
    // não o traz de volta ao campo nem o move de onde está
    tg.passTo('end', 0);
    expect(tg.find(UR, 'battlefield', 0)).toBeNull();
    expect(tg.find(UR, 'graveyard', 0) ?? tg.find(UR, 'command', 0)).not.toBeNull();
  });
});
