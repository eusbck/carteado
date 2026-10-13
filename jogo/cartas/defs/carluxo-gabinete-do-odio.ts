// Carluxo, Gabinete do Ódio (carta própria da mesa)
// {T}: Goad target creature an opponent controls. (Until your next turn, that creature attacks each combat if able and
// attacks a player other than you if able.)
import { activated, and, defineCard, goad, is, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Carluxo, Gabinete do Ódio',
  faces: [{
    abilities: [
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) goad(c.g, id, c.you);
      }, {
        targets: [t.creature(and(is.opponents), 'criatura alvo que um oponente controla')],
        text: '{T}: Incite a criatura alvo que um oponente controla.',
      }),
    ],
  }],
  rulings: {},
});
