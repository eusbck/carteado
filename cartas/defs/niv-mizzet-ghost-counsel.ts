// Niv-Mizzet, Ghost Counsel
// Flying
// Whenever you gain life, you may pay that much life. If you do, draw that many cards.
// {T}: Each opponent loses 1 life and you gain 1 life.
import { activated, defineCard, draw, gainLife, keyword, loseLife, on, payParts, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Niv-Mizzet, Ghost Counsel',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: um gatilho por evento de ganho de vida (cada fonte com vínculo com a vida é um evento, CR 702.15b)
      triggered(on.youGainLife(), function* (c) {
        const n = c.event.amount as number;
        // CR 119.4: só pode pagar vida se tiver pelo menos essa quantidade
        if (n <= 0 || c.g.state.players[c.you].life < n) return;
        if (!(yield* yesNo(c.g, c.you, `Niv-Mizzet: pagar ${n} de vida para comprar ${n} carta(s)?`))) return;
        const pago = yield* payParts(c.g, c.you, [{ k: 'life', n }], c.source, 0);
        if (pago !== false) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que você ganha vida, você pode pagar essa mesma quantidade de vida. Se fizer isso, compre essa mesma quantidade de cartas.' }),
      activated('{T}', function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: '{T}: Cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 — duas criaturas com vínculo com a vida causando dano de combate juntas disparam duas vezes',
  },
});
