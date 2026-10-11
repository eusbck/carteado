// Waste Management
// Kicker {3}{B} (You may pay an additional {3}{B} as you cast this spell.)
// Exile up to two target cards from a single graveyard. If this spell was kicked, instead exile target player's
// graveyard. Create a 2/2 black Rogue creature token for each creature card exiled this way.
import { additionalCost, createTokens, defineCard, exile, isCreature, t, tgtPlayer, tgtsAll } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

/** a mágica foi reforçada? (os alvos mudam com isso: CR 702.33g, 601.2c) */
const reforcada = (g: G, magica: ObjId): boolean => !!g.state.objects[magica]?.stack?.paid.kicker;

export default defineCard({
  name: 'Waste Management',
  faces: [{
    // CR 702.33a: custo adicional opcional, pago uma vez
    additionalCosts: [additionalCost('kicker', 'kicker {3}{B}', [{ k: 'mana', cost: '{3}{B}' }], { optional: true })],
    spell: {
      targets: [
        // sem o reforço: até duas cartas alvo de um mesmo cemitério
        {
          ...t.card('graveyard', undefined, 'até duas cartas alvo de um mesmo cemitério', 'any'),
          min: 0, max: (c) => (reforcada(c.g, c.source) ? 0 : 2),
          validateSet: (c, alvos) => new Set(alvos.map((r) => (r.kind === 'obj' ? c.g.state.objects[r.id]?.owner : -1))).size <= 1,
        },
        // com o reforço: o cemitério do jogador alvo
        { ...t.player(undefined, 'jogador alvo (o cemitério dele é exilado)'), min: 0, max: (c) => (reforcada(c.g, c.source) ? 1 : 0), validateSet: (c, alvos) => !reforcada(c.g, c.source) || alvos.length === 1 },
      ],
      *effect(c) {
        const g = c.g;
        let ids: ObjId[];
        if (c.paid.kicker) {
          const p = tgtPlayer(c, 1);
          if (p === null) return;
          ids = [...g.state.zones.graveyard[p]];
        } else ids = tgtsAll(c, 0);
        // ruling 7: uma ficha para cada carta de criatura exilada assim, com ou sem reforço
        const criaturas = ids.filter((id) => isCreature(g, id)).length;
        const exiladas = ids.length ? yield* exile(g, ids) : [];
        const n = Math.min(criaturas, exiladas.filter((x) => x !== null && x !== undefined).length);
        if (n > 0) yield* createTokens(g, c.you, 'Rogue', n);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: Waste Management não é um permanente',
    2: 'teste: CR 702.33: reforçada, exila o cemitério inteiro do jogador alvo',
    3: 'regra geral: CR 702.33a — o kicker é pago uma vez (motor/stack.ts castInner)',
    4: 'regra geral: CR 601.2f — o custo total soma os custos adicionais (motor/stack.ts totalSpellCost)',
    5: 'regra geral: CR 707.10 — a cópia de uma mágica copia as decisões, inclusive ter sido reforçada (motor/stack.ts copySpell)',
    6: 'não se aplica: Waste Management não é um permanente',
    7: 'teste: sem reforço, exila até duas cartas de um mesmo cemitério e cria um Rogue 2/2 por carta de criatura',
  },
});
