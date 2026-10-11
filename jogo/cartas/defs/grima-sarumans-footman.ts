// Gríma, Saruman's Footman
// Gríma can't be blocked.
// Whenever Gríma deals combat damage to a player, that player exiles cards from the top of their library until they exile
// an instant or sorcery card. You may cast that card without paying its mana cost. Then that player puts the exiled cards
// that weren't cast this way on the bottom of their library in a random order.
import { defineCard, exile, is, mayCastFree, moveObjects, nameOf, on, staticAbility, triggered } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Gríma, Saruman's Footman",
  faces: [{
    abilities: [
      staticAbility({ rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source }, text: 'Gríma não pode ser bloqueado.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const p = c.event.player as PlayerId;
        const exiladas: ObjId[] = [];
        let achada: ObjId | null = null;
        // ruling 4: exiladas viradas para cima, uma a uma, até sair uma instantânea ou feitiço
        while (s.zones.library[p].length) {
          const [ex] = yield* exile(c.g, [s.zones.library[p][0]]);
          if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') break;
          exiladas.push(ex);
          if (is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, ex)) { achada = ex; break; }
        }
        // rulings 1, 3, 6: conjurada agora, sem pagar o custo de mana (X = 0, sem custos alternativos)
        if (achada !== null) yield* mayCastFree(c.g, c.you, achada, `Gríma: conjurar ${nameOf(c.g, achada)} sem pagar o custo de mana?`);
        // rulings 2, 5: o que não foi conjurado vai para o fundo do grimório do dono em ordem aleatória
        const resto = exiladas.filter((id) => s.objects[id]?.zone === 'exile');
        if (resto.length) yield* moveObjects(c.g, shuffle(s.rng, [...resto]).map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      }, { text: 'Sempre que Gríma causa dano de combate a um jogador, esse jogador exila cartas do topo do grimório dele até exilar uma carta instantânea ou de feitiço. Você pode conjurar essa carta sem pagar o custo de mana. Depois esse jogador coloca as cartas exiladas que não foram conjuradas assim no fundo do grimório dele em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3b — X é 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    2: 'teste: recusando, a instantânea vai para o fundo do grimório do dono com as outras',
    3: 'regra geral: CR 118.9 — sem pagar o custo de mana não se combinam custos alternativos; os adicionais continuam (motor/stack.ts)',
    4: 'regra geral: CR 406.3 — as cartas são exiladas viradas para cima (motor/actions.ts exile)',
    5: 'regra geral: sem instantânea nem feitiço no grimório, todas as cartas exiladas voltam para o fundo em ordem aleatória (cartas/defs/grima-sarumans-footman.ts)',
    6: 'regra geral: CR 608.2g — conjurada durante a resolução (motor/mecanicas.ts mayCastFree)',
  },
});
