import { describe, expect, it } from 'vitest';
import { manaDesfazivel, performManual, validateManual } from '../../motor/manual.ts';
import { activateMana, fixture as setup, runEffect } from '../../testes/artefatos.ts';

const N = "Forsaken Monument";
describe(N, () => {
  it('desvirar para desfazer a produção retira também o bônus, conservando sua fonte real', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    tg.state.config.manualMode = true; tg.state.config.desvirarSoComMana = true;
    activateMana(tg, 'Sol Ring', 'C');
    const ring = tg.bf('Sol Ring');
    expect(tg.state.players[0].manaPool.at(-1)?.source).toBe(tg.bf(N));
    expect(manaDesfazivel(tg.state, ring)).toBe(true);
    const ajuste = { k: 'virar' as const, obj: ring, tapped: false };
    expect(validateManual(tg.g, 0, ajuste)).toBeNull();
    runEffect(tg, performManual(tg.g, 0, ajuste));
    expect(tg.state.objects[ring].tapped).toBe(false);
    expect(tg.state.players[0].manaPool).toHaveLength(0);
  });

  it('gastar só a mana do bônus também impede desvirar para produzir mana de graça', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []] });
    tg.state.config.manualMode = true; tg.state.config.desvirarSoComMana = true;
    activateMana(tg, 'Sol Ring', 'C');
    tg.state.players[0].manaPool = tg.state.players[0].manaPool.filter((u) => u.source !== tg.bf(N)); tg.g.bump();
    expect(tg.state.players[0].manaPool).toHaveLength(2);
    expect(manaDesfazivel(tg.state, tg.bf('Sol Ring'))).toBe(false);
    expect(validateManual(tg.g, 0, { k: 'virar', obj: tg.bf('Sol Ring'), tapped: false })).toContain('Desfazer');
  });
  it("mana adicional resolve imediatamente uma vez por ativação e o planejador a considera", () => {

    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Foundry Inspector'], []] }); expect(tg.canCast('Foundry Inspector')).toBe(true); tg.cast('Foundry Inspector'); expect(tg.state.players[0].manaPool).toHaveLength(0);
    tg.resolveAll(); expect(tg.life(0)).toBe(42); expect(tg.pt(tg.bf('Foundry Inspector'))).toEqual([5, 4]);
    const mana = setup({ battlefield: [[N, 'Sol Ring'], []] }); activateMana(mana, 'Sol Ring', 'C'); expect(mana.state.players[0].manaPool.map(u => u.type).join('')).toBe('CCC'); expect(mana.state.zones.stack).toHaveLength(0);
  });
});
