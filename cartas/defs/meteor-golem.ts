// Meteor Golem
// When this creature enters, destroy target nonland permanent an opponent controls.
import { and, defineCard, destroy, etb, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Meteor Golem',
  faces: [{
    abilities: [etb(function* (c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); }, {
      targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um oponente controla')],
      text: 'Quando esta criatura entra, destrua o permanente não terreno alvo que um oponente controla.',
    })],
  }],
  rulings: {},
});
