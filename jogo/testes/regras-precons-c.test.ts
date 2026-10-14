// Recursos do motor acrescentados para os precons Tramplesaurus Rex e Buckle Up (agente C), conferidos em
// ../fontes-oficiais/MagicCompRules-2026-09-25.txt.
import { describe, expect, it } from 'vitest';
import { chars } from '../motor/api.ts';
import { landPlaysAllowed } from '../motor/chars.ts';
import { crewPower } from '../motor/costs.ts';
import { registry } from '../motor/defs.ts';
import { fixture } from './artefatos.ts';
import { setup } from './harness.ts';

describe('restrição "não pode ser bloqueada por mais de N criaturas" (CR 509.1b, gancho maxBlockers)', () => {
  it('a declaração com mais bloqueadores que o limite é ilegal; até o limite vale', () => {
    // Challenger Troll: criaturas de força 4 ou mais do controlador têm limite 1
    const tg = fixture({ battlefield: [['Challenger Troll'], ['Indomitable Ancients', 'Wall of Omens']] });
    tg.attack([['Challenger Troll', 1]]).block([['Indomitable Ancients', 'Challenger Troll'], ['Wall of Omens', 'Challenger Troll']]);
    expect(() => tg.passTo('declareBlockers')).toThrow(/não pode ser bloqueada por mais de 1/);
    const ok = fixture({ battlefield: [['Challenger Troll'], ['Indomitable Ancients', 'Wall of Omens']] });
    ok.attack([['Challenger Troll', 1]]).block([['Wall of Omens', 'Challenger Troll']]).passTo('combatDamage');
    expect(ok.find('Wall of Omens')).toBeNull();
  });
  it('sem o gancho, nada muda', () => {
    expect([...registry.abilities.values()].filter((a) => a.kind === 'static' && a.rules?.maxBlockers).length).toBeGreaterThan(0);
    const tg = fixture({ battlefield: [['Indomitable Ancients'], ['Elvish Mystic', 'Wall of Omens']] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Elvish Mystic', 'Indomitable Ancients'], ['Wall of Omens', 'Indomitable Ancients']]).passTo('combatDamage');
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});

describe('terrenos adicionais por efeito contínuo (CR 305.2, gancho extraLandPlays)', () => {
  it('soma com o terreno normal e com os de efeitos que resolveram (Explore)', () => {
    const tg = setup({ battlefield: [['Loot, Exuberant Explorer', 'Forest', 'Forest'], []], hand: [['Explore', 'Forest', 'Forest', 'Forest', 'Forest'], []], library: [['Island'], []] });
    expect(landPlaysAllowed(tg.g, 0)).toBe(2);
    tg.cast('Explore').resolve();
    expect(landPlaysAllowed(tg.g, 0)).toBe(3);
    tg.play('Forest').play('Forest').play('Forest');
    expect(() => tg.play('Forest')).toThrow();
  });
  it('vale só para o controlador da fonte', () => {
    const tg = setup({ battlefield: [['Loot, Exuberant Explorer'], []] });
    expect(landPlaysAllowed(tg.g, 1)).toBe(1);
  });
});

describe('presente num permanente (CR 702.174b): o oponente escolhido chega ao permanente em data.spell.giftTo', () => {
  it('prometido, o objeto que entra sabe a quem; sem prometer, não', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Scrapshooter', 'Scrapshooter'], []], library: [[], ['Island']] });
    tg.choose('presente', ['Prometer a Bruno']).cast('Scrapshooter').resolveAll();
    const [a] = tg.all('Scrapshooter');
    expect((tg.state.objects[a].data.spell as { giftTo?: number }).giftTo).toBe(1);
    tg.choose('presente', ['Não prometer']).cast('Scrapshooter').resolveAll();
    const b = tg.all('Scrapshooter').find((id) => id !== a)!;
    expect((tg.state.objects[b].data.spell as { paid: Record<string, unknown> }).paid.gift).toBeFalsy();
  });
});

describe('"tripula Veículos como se a força fosse N maior" (CR 702.122a, palavra-chave crewBonus)', () => {
  it('a força para tripular soma o bônus; a força da criatura não muda', () => {
    const tg = setup({ battlefield: [[{ name: 'Pilot', token: true }, 'Elvish Mystic', "Cultivator's Caravan"], []] });
    expect(crewPower(tg.g, tg.bf('Pilot'))).toBe(3);
    expect(crewPower(tg.g, tg.bf('Elvish Mystic'))).toBe(1);
    expect(tg.pt(tg.bf('Pilot'))).toEqual([1, 1]);
  });
  it('sem a ficha, a Elvish Mystic sozinha (força 1) não tripula 3', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', "Cultivator's Caravan"], []] });
    expect(() => tg.activate("Cultivator's Caravan", 'Tripular')).toThrow();
    const com = setup({ battlefield: [[{ name: 'Pilot', token: true }, "Cultivator's Caravan"], []] });
    com.choose('Tripular:', ['Pilot']).choose('Tripular:', ['done']).activate("Cultivator's Caravan", 'Tripular').resolveAll();
    expect(chars(com.g, com.bf("Cultivator's Caravan")).types).toContain('Creature');
  });
});
