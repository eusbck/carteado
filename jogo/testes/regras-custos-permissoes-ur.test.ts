// Custos, permissões e mana do lote3-e (deck Ur-Dragon):
// - AdditionalCostDef.afterTargets: custo concedido que olha os alvos, decidido depois deles (CR 601.2c, 601.2f;
//   Terror of the Peaks);
// - CastPermission.fromCommand: a permissão vale para o comandante na zona de comando, com o imposto (CR 903.8;
//   Dracogenesis);
// - "essa mágica não pode ser anulada" preso à mana gasta (CR 101.2, 106.6; spellCantBeCountered);
// - manaSpent.fromTreasures: quanta mana de Tesouros foi gasta na mágica (Smaug, Wicked Worm).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { counter, createTokens, spellCantBeCountered } from '../motor/api.ts';
import { activateMana } from './artefatos.ts';

describe('Custos e permissões (lote3-e)', () => {
  it('CR 601.2f: custo concedido depois dos alvos: só quem escolhe o alvo paga; sem vida, a conjuração é desfeita', () => {
    const tg = setup({ battlefield: [['Terror of the Peaks'], ['Plains', 'Plains', 'Plains', 'Plains']], hand: [[], ["Avatar's Wrath", "Avatar's Wrath"]], active: 1 });
    tg.state.players[1].life = 2;
    tg.refresh();
    tg.choose('até uma criatura alvo', ['Terror of the Peaks']);
    try { tg.cast("Avatar's Wrath"); } catch { /* recusada */ }
    expect(tg.life(1)).toBe(2);
    expect(tg.state.zones.stack.length).toBe(0);
    // sem alvo, não paga vida
    tg.choose('até uma criatura alvo', []);
    tg.cast("Avatar's Wrath");
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.life(1)).toBe(2);
  });

  it('CR 903.8: a permissão fromCommand conjura o comandante sem o custo de mana, mas com o imposto', () => {
    const tg = setup({ battlefield: [['Dracogenesis', 'Mountain', 'Mountain'], []], command: [[{ name: 'The Ur-Dragon', commander: true }], []] });
    const card = tg.state.objects[tg.find('The Ur-Dragon', 'command')!].card!;
    tg.state.players[0].commanderCasts[String(card)] = 1;
    tg.refresh();
    const acao = tg.actionIds().find((a) => a.includes(':perm:dracogenesis'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    // pagou só o imposto {2}
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped).length).toBe(2);
  });

  it('CR 101.2: a mágica marcada pela mana gasta não é anulada', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.cast('Elvish Mystic');
    const sp = tg.state.zones.stack[0];
    spellCantBeCountered(tg.g, sp);
    expect(tg.run(counter(tg.g, sp))).toBe(false);
    expect(tg.state.zones.stack).toEqual([sp]);
  });

  it('manaSpent.fromTreasures conta a mana de Tesouros, mesmo sacrificados', () => {
    const tg = setup({ battlefield: [['Forest'], []], hand: [['Elvish Mystic'], []] });
    tg.run(createTokens(tg.g, 0, 'Treasure', 1));
    activateMana(tg, 'Treasure', 'G');
    tg.cast('Elvish Mystic');
    expect(tg.state.objects[tg.state.zones.stack[0]].stack!.manaSpent!.fromTreasures).toBe(1);
  });
});
