// Zulaport Cutthroat
// Whenever this creature or another creature you control dies, each opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Zulaport Cutthroat',
  faces: [{
    abilities: [triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
      for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      gainLife(c.g, c.you, 1, c.source);
    }, { text: 'Sempre que esta criatura ou outra criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' })],
  }],
  rulings: { 1: 'teste: CR 603.10a: morrendo junto com outra, dispara para as duas' },
});
