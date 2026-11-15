// The Misty Mountains Cold
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)
// I, II, III, IV — Create a Treasure token. Then if you control four or more Treasures, sacrifice this Saga.
// If you do, create a 6/6 red Dragon creature token with flying. (A Treasure token is an artifact with
// "{T}, Sacrifice this token: Add one mana of any color.")
import { chapter, chars, controlledBy, controllerOf, createTokens, defineCard, sacrifice, sagaEnters } from '../../motor/api.ts';

export default defineCard({
  name: 'The Misty Mountains Cold',
  faces: [{ abilities: [
    sagaEnters(),
    chapter([1, 2, 3, 4], function* (c) {
      yield* createTokens(c.g, c.you, 'Treasure', 1);
      const tesouros = controlledBy(c.g, c.you, (id) => {
        const ch = chars(c.g, id);
        return ch.types.includes('Artifact') && ch.subtypes.includes('Treasure');
      });
      if (tesouros.length < 4 || c.g.state.objects[c.source]?.zone !== 'battlefield' || controllerOf(c.g, c.source) !== c.you) return;
      const [sacrificada] = yield* sacrifice(c.g, [c.source]);
      if (sacrificada != null) yield* createTokens(c.g, c.you, 'Dragon 6/6', 1);
    }, { text: 'I, II, III, IV — Crie uma ficha de Tesouro. Depois, se você controlar quatro ou mais Tesouros, sacrifique esta Saga. Se fizer isso, crie uma ficha de criatura Dragão vermelha 6/6 com voar.' }),
  ] }],
  rulings: {},
});
