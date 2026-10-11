import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Panther Habit';

describe(N, () => {
  it('o dano à criatura equipada é prevenido e vira marcadores +1/+1 nela', () => {
    const tg = setup({ battlefield: [['Silver Myr', { name: N, attachTo: 'Silver Myr' }, 'Elvish Mystic'], ['Serra Angel']] });
    const myr = tg.bf('Silver Myr');
    dealDamage(tg.g, [{ source: tg.bf('Serra Angel'), target: { kind: 'obj', id: myr }, amount: 4, combat: false }]);
    tg.refresh();
    expect(tg.state.objects[myr].damage).toBe(0);
    expect(tg.pt(myr)).toEqual([5, 5]);
    // a outra criatura leva o dano normalmente
    const elfo = tg.bf('Elvish Mystic');
    dealDamage(tg.g, [{ source: tg.bf('Serra Angel'), target: { kind: 'obj', id: elfo }, amount: 1, combat: false }]);
    expect(tg.state.objects[elfo].damage).toBe(1);
  });
});