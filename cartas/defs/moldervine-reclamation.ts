// Moldervine Reclamation
// Whenever a creature you control dies, you gain 1 life and draw a card.
import { defineCard, draw, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Moldervine Reclamation',
  faces: [{
    abilities: [triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
      gainLife(c.g, c.you, 1, c.source);
      yield* draw(c.g, c.you, 1);
    }, { text: 'Sempre que uma criatura que você controla morre, você ganha 1 de vida e compra uma carta.' })],
  }],
  rulings: {
    1: 'regra geral: CR 704.3 — a derrota por 0 de vida acontece antes do gatilho',
    2: 'teste: CR 603.10a: se sai do campo junto com as criaturas, dispara para cada uma',
  },
});
