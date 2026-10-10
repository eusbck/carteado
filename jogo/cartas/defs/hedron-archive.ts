// Hedron Archive
// {T}: Add {C}{C}.
// {2}, {T}, Sacrifice this artifact: Draw two cards.
import { activated, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Hedron Archive",
  faces: [{ abilities: [mana('CC'), activated('{2}, {T}, Sacrifice this artifact', function*(c) { yield* draw(c.g, c.you, 2); }, { text: '{2}, {T}, Sacrifique este artefato: compre duas cartas.' })] }],
  rulings: {},
});
