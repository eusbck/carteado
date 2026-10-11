import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Taunt from the Rampart';
const naoBloqueia = (tg: ReturnType<typeof setup>, id: number) => tg.state.effects.some((e) => e.affected?.includes(id) && e.mods.some((m) => m.k === 'rule' && m.id === 'rule:cantBlock'));

describe(N, () => {
  it('goada as criaturas dos oponentes, que não podem bloquear até o seu próximo turno', () => {
    const lib = Array(8).fill('Forest');
    const tg = setup({ players: 3, battlefield: [['Mountain', 'Mountain', 'Mountain', 'Plains', 'Plains', 'Elvish Mystic'], ['Indomitable Ancients'], ['Silver Myr']], hand: [[N], [], []], library: [lib, lib, lib] });
    tg.cast(N).resolveAll();
    const anciao = tg.bf('Indomitable Ancients');
    const myr = tg.bf('Silver Myr');
    expect(tg.state.objects[anciao].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[myr].goadedBy.map((x) => x.player)).toEqual([0]);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].goadedBy).toEqual([]);
    expect(naoBloqueia(tg, anciao) && naoBloqueia(tg, myr)).toBe(true);
    expect(naoBloqueia(tg, tg.bf('Elvish Mystic'))).toBe(false);
    // continua valendo no turno dos oponentes e acaba no seu próximo turno
    tg.passTo('main1', 1);
    expect(naoBloqueia(tg, anciao)).toBe(true);
    tg.passTo('main1', 2);
    tg.passTo('main1', 0);
    expect(naoBloqueia(tg, anciao)).toBe(false);
  });
});
