// Smaug, Wicked Worm
// Flying
// When Smaug enters, create X tapped Treasure tokens, where X is the number of artifacts your opponents control.
// Whenever you cast a spell, if mana from a Treasure was spent to cast it, you draw a card and lose 1 life.
import { controllerOf, createTokens, defineCard, draw, etb, isType, keyword, loseLife, on, triggered, type G } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

// a mana gasta fica na mágica; se ela já saiu da pilha, pela última informação
const deTesouro = (g: G, id: ObjId) => ((g.state.objects[id] ?? g.state.lki[id]?.obj)?.stack?.manaSpent?.fromTreasures ?? 0) > 0;

export default defineCard({
  name: 'Smaug, Wicked Worm',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const n = c.g.state.zones.battlefield.filter((id) => isType(c.g, id, 'Artifact') && c.g.isOpponent(c.you, controllerOf(c.g, id))).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Treasure', n, { tapped: true });
      }, { text: 'Quando Smaug entra, crie X fichas de Tesouro viradas, onde X é o número de artefatos que os seus oponentes controlam.' }),
      // CR 603.4: "se mana de um Tesouro foi gasta para conjurá-la"
      triggered(on.youCast(), function* (c) {
        yield* draw(c.g, c.you, 1);
        loseLife(c.g, c.you, 1, c.source);
      }, {
        condition: (c) => deTesouro(c.g, c.event.spell as ObjId),
        text: 'Sempre que você conjura uma mágica, se mana de um Tesouro foi gasta para conjurá-la, você compra uma carta e perde 1 de vida.',
      }),
    ],
  }],
  rulings: {},
});
