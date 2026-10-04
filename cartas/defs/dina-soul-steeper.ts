// Dina, Soul Steeper
// Whenever you gain life, each opponent loses 1 life.
// {1}, Sacrifice another creature: Dina gets +X/+0 until end of turn, where X is the sacrificed creature's power.
import { activated, defineCard, lkiChars, loseLife, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Dina, Soul Steeper',
  faces: [{
    abilities: [
      // rulings 1-3: um gatilho por evento de ganho de vida; perde só 1
      triggered(on.youGainLife(), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que você ganha vida, cada oponente perde 1 de vida.' }),
      activated('{1}, Sacrifice another creature', function* (c) {
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        const x = sac !== undefined ? lkiChars(c.g, sac)?.power ?? 0 : 0; // ruling 4
        if (c.g.state.objects[c.source]) untilEndOfTurn(c, [c.source], [{ k: 'pt', p: x, t: 0 }]);
      }, { text: '{1}, Sacrifique outra criatura: Dina recebe +X/+0 até o fim do turno, onde X é a força da criatura sacrificada.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.3 e 510.2 — cada criatura com vínculo com a vida gera um evento de ganho de vida',
    2: 'teste: dispara uma vez por evento, qualquer que seja a quantidade',
    3: 'teste: cada oponente perde só 1',
    4: 'teste: X é a força da criatura no campo',
  },
});
