// Aether Spellbomb
// {U}, Sacrifice this artifact: Return target creature to its owner's hand.
// {1}, Sacrifice this artifact: Draw a card.
import { activated, defineCard, draw, returnToHand, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Aether Spellbomb",
  faces: [{
    abilities: [
      activated('{U}, Sacrifice this artifact', function*(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); }, { targets: [t.creature()], text: '{U}, Sacrifique este artefato: devolva a criatura alvo à mão de seu dono.' }),
      activated('{1}, Sacrifice this artifact', function*(c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, Sacrifique este artefato: compre uma carta.' }),
    ]
  }],
  rulings: {},
});
