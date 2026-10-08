// Stitch Together
// Return target creature card from your graveyard to your hand.
// Threshold — Return that card from your graveyard to the battlefield instead if there are seven or more cards in your
// graveyard.
import { defineCard, is, moveObjects, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Stitch Together',
  faces: [{
    spell: {
      targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
      *effect(c) {
        // ruling 1: conta ao começar a resolver (esta mágica está na pilha, não no cemitério)
        const limiar = c.g.state.zones.graveyard[c.you].length >= 7;
        const id = tgt(c);
        if (id === null) return;
        if (limiar) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        else yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      },
    },
  }],
  rulings: { 1: 'teste: com sete cartas no cemitério, a criatura vai para o campo' },
});
