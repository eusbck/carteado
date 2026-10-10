// Soul-Guide Lantern
// When this artifact enters, exile target card from a graveyard.
// {T}, Sacrifice this artifact: Exile each opponent's graveyard.
// {1}, {T}, Sacrifice this artifact: Draw a card.
import { activated, defineCard, draw, etb, exile, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: "Soul-Guide Lantern",
  faces: [{
    abilities: [
      etb(function*(c) { const id = tgt(c); if (id !== null) yield* exile(c.g, [id]); }, { targets: [t.card('graveyard', undefined, 'carta alvo em um cemitério', 'any')], text: 'Quando entra, exile a carta alvo de um cemitério.' }),
      activated('{T}, Sacrifice this artifact', function*(c) { yield* exile(c.g, c.g.opponents(c.you).flatMap((p) => [...c.g.state.zones.graveyard[p]])); }, { text: '{T}, Sacrifique este artefato: exile os cemitérios dos oponentes.' }),
      activated('{1}, {T}, Sacrifice this artifact', function*(c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Sacrifique este artefato: compre uma carta.' }),
    ]
  }],
  rulings: {},
});
