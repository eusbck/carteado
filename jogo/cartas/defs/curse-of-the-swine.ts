// Curse of the Swine
// Exile X target creatures. For each creature exiled this way, its controller creates a 2/2 green Boar creature token.
import { candidateTargets, controllerOf, createTokens, defineCard, exile, t, tgtsAll } from '../../motor/api.ts';
import type { TargetSpec } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

// "X criaturas alvo": exatamente X (CR 601.2c, 107.3a)
const ALVOS: TargetSpec = {
  ...t.creature(undefined, 'X criaturas alvo'), min: 0, max: (c) => c.x ?? 0,
  validateSet: (c, escolhidos) => escolhidos.length === ((c as { x?: number }).x ?? 0),
};

export default defineCard({
  name: 'Curse of the Swine',
  faces: [{
    spell: {
      targets: [ALVOS],
      // X não passa do número de criaturas que podem ser alvo
      xMax: (c) => candidateTargets(c.g, ALVOS, c.you, c.source).length,
      *effect(c) {
        const ids = tgtsAll(c);
        if (!ids.length) return;
        const donos = new Map(ids.map((id) => [id, controllerOf(c.g, id)] as [number, PlayerId]));
        const res = yield* exile(c.g, ids);
        // uma ficha para cada criatura que foi mesmo exilada, para quem a controlava
        const porJogador = new Map<PlayerId, number>();
        ids.forEach((id, i) => {
          const novo = res[i];
          if (novo === null || novo === undefined) return;
          const p = donos.get(id)!;
          porJogador.set(p, (porJogador.get(p) ?? 0) + 1);
        });
        for (const p of c.g.apnap()) {
          const n = porJogador.get(p) ?? 0;
          if (n > 0 && !c.g.state.players[p].left) yield* createTokens(c.g, p, 'Boar', n);
        }
      },
    },
  }],
  rulings: {},
});
