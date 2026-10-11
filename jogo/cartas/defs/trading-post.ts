// Trading Post
// {1}, {T}, Discard a card: You gain 4 life.
// {1}, {T}, Pay 1 life: Create a 0/1 white Goat creature token.
// {1}, {T}, Sacrifice a creature: Return target artifact card from your graveyard to your hand.
// {1}, {T}, Sacrifice an artifact: Draw a card.
import { activated, createTokens, defineCard, draw, gainLife, isType, moveObjects, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Trading Post',
  faces: [{
    abilities: [
      activated('{1}, {T}, Discard a card', function* (c) { gainLife(c.g, c.you, 4, c.source); }, { text: '{1}, {T}, Descarte uma carta: Você ganha 4 de vida.' }),
      activated('{1}, {T}, Pay 1 life', function* (c) { yield* createTokens(c.g, c.you, 'Goat', 1); }, { text: '{1}, {T}, Pague 1 de vida: Crie uma ficha de criatura Goat 0/1 branca.' }),
      activated('{1}, {T}, Sacrifice a creature', function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, { targets: [t.card('graveyard', (c, id) => isType(c.g, id, 'Artifact'), 'carta de artefato alvo do seu cemitério', 'you')], text: '{1}, {T}, Sacrifique uma criatura: Devolva a carta de artefato alvo do seu cemitério para a sua mão.' }),
      activated('{1}, {T}, Sacrifice an artifact', function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{1}, {T}, Sacrifique um artefato: Compre uma carta.' }),
    ],
  }],
  rulings: {},
});