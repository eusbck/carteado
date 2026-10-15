// Recursos do motor acrescentados para o deck Miracle Worker (precons-e). O milagre tem o próprio arquivo
// (testes/regras-milagre.test.ts).
import { describe, expect, it } from 'vitest';
import { hasKw, removeCounters, untilEndOfTurn } from '../motor/api.ts';
import type { Ctx } from '../motor/defs.ts';
import { setup } from './harness.ts';

describe('Recursos do motor (precons-e)', () => {
  it('CR 101.2: "não pode ter" (StaticDef.cantHave) vence quem dá a palavra-chave, mesmo com registro de data e hora posterior', () => {
    // Archetype of Imagination: "as criaturas dos oponentes perdem voar e não podem ter nem ganhar voar"
    const tg = setup({ battlefield: [['Archetype of Imagination'], ['Indomitable Ancients', 'Zetalpa, Primal Dawn']] });
    const ancients = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, tg.bf('Zetalpa, Primal Dawn'), 'flying')).toBe(false);
    untilEndOfTurn({ g: tg.g, you: 1, source: ancients } as unknown as Ctx, [ancients], [{ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'vigilance' }]);
    tg.g.bump();
    expect(hasKw(tg.g, ancients, 'flying')).toBe(false);
    expect(hasKw(tg.g, ancients, 'vigilance')).toBe(true);
  });

  it('CR 601.2, 118.9: permissão de conjurar que vale da mão (CastPermission.fromHand) aparece como mais uma opção, com o custo dela', () => {
    // Demon of Fate's Design: uma mágica de encantamento da mão pagando vida igual ao valor de mana
    const tg = setup({ battlefield: [["Demon of Fate's Design"], []], hand: [['Ghostly Prison', 'Wall of Omens'], []] });
    const opcoes = (nome: string) => tg.actionIds().filter((a) => a.startsWith('cast:') && a.split(':')[1] === String(tg.find(nome, 'hand', 0)));
    // sem mana, só a opção da permissão; a carta que não passa no filtro não tem opção nenhuma
    expect(opcoes('Ghostly Prison').map((a) => a.split(':').slice(2, 3)[0])).toEqual(['perm']);
    expect(opcoes('Wall of Omens')).toEqual([]);
  });

  it('CR 305.1, 401.5: terreno do topo do grimório com permissão de jogar dali usa a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [['One with the Multiverse'], []], hand: [['Plains'], []], library: [['Island', 'Swamp'], []] });
    const doTopo = () => tg.actionIds().find((a) => a.startsWith('play:') && a.split(':')[1] === String(tg.state.zones.library[0][0]));
    tg.answer({ kind: 'priority', action: doTopo()! });
    tg.settle();
    expect(tg.find('Island')).not.toBeNull();
    expect(doTopo()).toBeUndefined();
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('CR 122.1d: marcador que não pode ser removido (gancho cantRemoveCounters): a permanente atordoada do oponente não desvira', () => {
    const tg = setup({ battlefield: [['Fear of Sleep Paralysis', { name: 'Wall of Omens', tapped: true, counters: { stun: 1 } }], [{ name: 'Indomitable Ancients', tapped: true, counters: { stun: 1 } }]] });
    const deles = tg.bf('Indomitable Ancients');
    const meu = tg.bf('Wall of Omens');
    expect(removeCounters(tg.g, { kind: 'obj', id: deles }, 'stun', 1)).toBe(0);
    expect(tg.state.objects[deles].counters.stun).toBe(1);
    // os seus continuam perdendo o marcador normalmente
    expect(removeCounters(tg.g, { kind: 'obj', id: meu }, 'stun', 1)).toBe(1);
  });
});
