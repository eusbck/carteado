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

  // ruling 1 (CR 106.12, 605.1b): só conta virar um permanente por uma habilidade de mana que produz {C}
  it('virar artefatos para improvisar e virar um terreno para gerar mana colorida não adicionam {C}', () => {
    const tg = setup({ battlefield: [[N, 'Island', ...Array.from({ length: 5 }, () => ({ name: 'Myr', token: true, ready: false }))], []], hand: [['Kappa Cannoneer'], []] });
    tg.cast('Kappa Cannoneer');
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(6);
    // a Island pagou o {U} e cinco artefatos improvisaram o {5}: nenhuma mana adicional sobrou na reserva
    expect(tg.state.players[0].manaPool).toHaveLength(0);
    const ilha = setup({ battlefield: [[N, 'Island'], []] });
    activateMana(ilha, 'Island', 'U');
    expect(ilha.state.players[0].manaPool.map((u) => u.type).join('')).toBe('U');
  });

  // ruling 4 (CR 305.9): jogar um terreno não é conjurar uma mágica
  it('jogar um terreno, que é incolor, não dá vida', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []] });
    tg.play('Island');
    expect(tg.find('Island')).not.toBeNull();
    expect(tg.life(0)).toBe(40);
  });

  // ruling 5 (CR 202.2): a cor vem do custo de mana ou do indicador, não da mana que o permanente produz
  it('criatura incolor que gera mana colorida continua incolor e com o bônus; a criatura colorida não recebe', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr', 'Elvish Mystic'], []] });
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([1, 1]);
    activateMana(tg, 'Silver Myr', 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type).join('')).toBe('U');
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([3, 3]);
  });
});
