// Dragon's Hoard
// Whenever a Dragon you control enters, put a gold counter on this artifact.
// {T}, Remove a gold counter from this artifact: Draw a card.
// {T}: Add one mana of any color.
import { activated, addCounters, and, defineCard, draw, is, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Dragon's Hoard",
  faces: [{
    abilities: [
      triggered(on.enters(and(is.subtype('Dragon'), is.yours)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'gold', 1, c.you);
      }, { text: 'Sempre que um Dragon que você controla entra, coloque um marcador de ouro neste artefato.' }),
      activated('{T}, Remove a gold counter from this artifact', function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: '{T}, Remova um marcador de ouro deste artefato: Compre uma carta.' }),
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});
