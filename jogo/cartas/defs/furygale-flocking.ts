// Furygale Flocking
// This spell costs {1} less to cast for each instant and sorcery card in your graveyard.
// For each opponent, create two 3/3 blue and red Elemental creature tokens with flying that attack that opponent this
// turn if able. They gain haste until end of turn.
import { createTokens, defineCard, isInstantOrSorcery, ruleEffect, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Furygale Flocking',
  faces: [{
    selfCost: (c) => ({ reduce: c.g.state.zones.graveyard[c.you].filter((id) => isInstantOrSorcery(c.g, id)).length }),
    spell: {
      *effect(c) {
        const todas: ObjId[] = [];
        for (const op of c.g.opponents(c.you)) {
          const fichas = yield* createTokens(c.g, c.you, 'Elemental 3/3', 2);
          todas.push(...fichas);
          // rulings 2-4: atacam esse oponente se puderem
          ruleEffect(c, 'rule:attacksIfAble', { kind: 'endOfTurn' }, { objs: fichas, params: { player: op } });
        }
        untilEndOfTurn(c, todas, [{ k: 'addKeyword', kw: 'haste' }]);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 601.2f — custo total',
    2: 'teste: cada par é obrigado a atacar o seu oponente',
    3: 'regra geral: CR 508.1d — virada ou impedida, não ataca',
    4: 'regra geral: CR 508.1d — exigência não obriga a pagar custo',
  },
});
