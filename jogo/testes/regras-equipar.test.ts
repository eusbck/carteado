// Ganchos do tema "custos de equipar": custo alternativo {0} e alvos no abilityCostModifier, ativar como instantânea,
// registro de ativações do turno, anexos de quem foi sacrificado no custo e "bloqueia se puder" (CR 509.1c).
import { describe, expect, it } from 'vitest';
import { addEffect, defineToken, equip, keyword, staticAbility } from '../motor/api.ts';
import { defaultAnswer } from '../motor/ask.ts';
import { blockRequirements, validateBlocks } from '../motor/combat.ts';
import { fixture } from './artefatos.ts';

const verde = 'Teste equipar verde';
defineToken({ id: verde, name: verde, types: ['Artifact'], subtypes: ['Equipment'], colors: [], power: null, toughness: null, abilities: [equip('{1}{G}')] });
const gratis = 'Teste equipar de graça';
defineToken({
  id: gratis, name: gratis, types: ['Enchantment'], subtypes: [], colors: [], power: null, toughness: null,
  abilities: [staticAbility({ rules: { abilityCostModifier: (c, p, _f, def) => (p === c.you && def.kw === 'equip' ? { reduce: 0, free: true } : null), activateAsInstant: (c, p, _f, def) => p === c.you && def.kw === 'equip' } })],
});
const ameaca = 'Teste ameaça';
defineToken({ id: ameaca, name: ameaca, types: ['Creature'], subtypes: [], colors: [], power: 2, toughness: 2, abilities: [keyword('menace')] });

describe('custos de equipar (motor/stack.ts)', () => {
  it('CR 118.9: o custo alternativo {0} dispensa também a mana colorida', () => {
    const tg = fixture({ battlefield: [[{ name: gratis, token: true }, { name: verde, token: true }, 'Indomitable Ancients'], []] });
    tg.activate(verde, 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf(verde)].attachedTo).toBe(tg.bf('Indomitable Ancients'));
  });

  it('activateAsInstant: equipar fora da fase principal; sem o gancho, não', () => {
    const tg = fixture({ battlefield: [[{ name: gratis, token: true }, { name: verde, token: true }, 'Indomitable Ancients'], []] });
    tg.passTo('beginCombat', 0);
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(verde)}:`))).toBe(true);
    const tg2 = fixture({ battlefield: [[{ name: verde, token: true }, 'Indomitable Ancients', 'Forest', 'Forest'], []] });
    tg2.passTo('beginCombat', 0);
    expect(tg2.actionIds().some((a) => a.startsWith(`act:${tg2.bf(verde)}:`))).toBe(false);
  });

  it('turnStats.activationLog registra a palavra-chave e se o alvo era criatura de quem ativou; zera no turno seguinte', () => {
    const tg = fixture({ battlefield: [[{ name: verde, token: true }, 'Indomitable Ancients', 'Forest', 'Forest'], []] });
    tg.activate(verde, 'Equipar').resolveAll();
    expect(tg.state.turnStats[0].activationLog).toEqual([{ kw: 'equip', ownCreatureTargeted: true }]);
    tg.passTo('main1', 1);
    expect(tg.state.turnStats[0].activationLog ?? []).toEqual([]);
  });

  it('o custo de sacrificar a fonte guarda o que estava anexado a ela (costInfo.attachments)', () => {
    const tg = fixture({ battlefield: [['Zack Fair', { name: 'Shadowspear', attachTo: 'Zack Fair' }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate('Zack Fair', 'sacrifique');
    const ab = tg.state.objects[tg.state.zones.stack[0]];
    expect((ab.stack!.data.costInfo as { attachments: number[] }).attachments).toEqual([tg.bf('Shadowspear')]);
  });
});

describe('"bloqueia [atacante] se puder" (CR 509.1c, motor/combat.ts)', () => {
  const exige = (tg: ReturnType<typeof fixture>, blocker: number, attacker: number) => {
    addEffect(tg.g, { source: blocker, sourceDef: '', controller: 0, duration: { kind: 'endOfCombat' }, affected: null, mods: [{ k: 'rule', id: 'rule:blocksIfAble', params: { blocker, attacker } }] });
  };

  it('recusa a declaração sem o bloqueio exigido; a resposta padrão o inclui', () => {
    const tg = fixture({ battlefield: [['Indomitable Ancients'], ['Wall of Omens', 'Serra Angel']] });
    let decisao: unknown = null;
    tg.attack([['Indomitable Ancients', 1]]);
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      decisao = d;
      return defaultAnswer(d);
    });
    // a exigência entra depois de declarados os atacantes
    tg.passUntil((t) => t.state.turn.step === 'declareAttackers');
    const at = tg.bf('Indomitable Ancients');
    const anjo = tg.bf('Serra Angel');
    exige(tg, anjo, at);
    expect(validateBlocks(tg.g, 1, [])).toMatch(/precisa bloquear/);
    expect(validateBlocks(tg.g, 1, [[tg.bf('Wall of Omens'), at]])).toMatch(/precisa bloquear/);
    expect(validateBlocks(tg.g, 1, [[anjo, at]])).toBeNull();
    tg.passTo('declareBlockers');
    expect((decisao as { requiredBlocks?: unknown }).requiredBlocks).toEqual([[anjo, at]]);
    expect(tg.state.combat!.blockers.map((b) => b.id)).toEqual([anjo]);
  });

  it('com ameaçar o bloqueador sozinho não é exigido (precisaria de outro)', () => {
    const tg = fixture({ battlefield: [[{ name: ameaca, token: true }], ['Serra Angel']] });
    tg.attack([[ameaca, 1]]);
    tg.passUntil((t) => t.state.turn.step === 'declareAttackers');
    exige(tg, tg.bf('Serra Angel'), tg.bf(ameaca));
    expect(blockRequirements(tg.g, 1).size).toBe(0);
    expect(validateBlocks(tg.g, 1, [])).toBeNull();
  });
});
