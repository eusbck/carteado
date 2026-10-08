// Ravenous Chupacabra — When this creature enters, destroy target creature an opponent controls.
import { defineCard, destroy, etb, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Ravenous Chupacabra',
  faces: [{
    abilities: [etb(function* (c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); }, {
      targets: [t.creature(is.opponents, 'criatura alvo que um oponente controla')],
      text: 'Quando entra, destrua a criatura alvo que um oponente controla.',
    })],
  }],
});
