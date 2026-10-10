import { describe, expect, it } from 'vitest';
import { combatDamagePlayers } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Steel Hellkite";
describe(N, () => {
  it('X zero destrói fichas após dano e o histórico deixa de valer no turno seguinte', () => {
    const tg = setup({ battlefield: [[N], [{ name: 'Thopter', token: true }]] });
    const source = tg.bf(N); tg.attack([[N, 1]]).passTo('main2');
    expect(combatDamagePlayers(tg.g, source)).toEqual([1]);
    tg.number('valor de X', 0).activate(N, 'destrua').resolveAll(); expect(tg.all('Thopter')).toHaveLength(0);
    tg.passTo('upkeep', 1); expect(combatDamagePlayers(tg.g, source)).toEqual([]); expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
  });
  it("pump até fim do turno e destruição por X usa dano de combate deste turno", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], ['Sol Ring', 'Elvish Mystic', 'Island']] }); tg.activate(N, 'recebe').resolveAll(); expect(tg.pt(tg.bf(N))).toEqual([6, 5]);
    tg.attack([[N, 1]]).passTo('main2'); expect(tg.life(1)).toBe(34); tg.state.objects[tg.bf('Sol Ring', 0)].tapped = false; tg.g.bump(); tg.refresh();
    tg.number('valor de X', 1).activate(N, 'destrua').resolveAll(); expect(tg.find('Sol Ring', 'battlefield', 1)).toBeNull(); expect(tg.find('Elvish Mystic')).toBeNull(); expect(tg.find('Island')).not.toBeNull();
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.filter(a => a.kind === 'activate' && a.label.includes('destrua'))).toHaveLength(0);
  });

  it("X zero não exige dano prévio; sem dano não destrói e histórico muda no turno seguinte", () => {

    const tg = setup({ battlefield: [[N], [{ name: 'Thopter', token: true }]] }); tg.number('valor de X', 0).activate(N, 'destrua').resolveAll(); expect(tg.all('Thopter')).toHaveLength(1);
  });
});
