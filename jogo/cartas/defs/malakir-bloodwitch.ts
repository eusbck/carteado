// Malakir Bloodwitch
// Flying, protection from white
// When this creature enters, each opponent loses life equal to the number of Vampires you control. You gain life equal to
// the life lost this way.
import { controlledBy, defineCard, etb, gainLife, isSubtype, keyword, loseLife, protectionFrom } from '../../motor/api.ts';

export default defineCard({
  name: 'Malakir Bloodwitch',
  faces: [{
    abilities: [
      keyword('flying'),
      protectionFrom('W'),
      etb(function* (c) {
        // contado na resolução; você ganha o total de vida efetivamente perdida
        const n = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Vampire')).length;
        if (n <= 0) return;
        let perdida = 0;
        for (const p of c.g.opponents(c.you)) {
          const antes = c.g.state.players[p].life;
          loseLife(c.g, p, n, c.source);
          perdida += Math.max(0, antes - c.g.state.players[p].life);
        }
        if (perdida > 0) gainLife(c.g, c.you, perdida, c.source);
      }, { text: 'Quando esta criatura entra, cada oponente perde vida igual ao número de Vampires que você controla. Você ganha vida igual à vida perdida assim.' }),
    ],
  }],
  rulings: {},
});
