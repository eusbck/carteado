// Tatyova, Benthic Druid
// Landfall — Whenever a land you control enters, you gain 1 life and draw a card.
import { defineCard, draw, gainLife, on, triggered } from '../../motor/api.ts';
import { ATERRAGEM } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Tatyova, Benthic Druid',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
        yield* draw(c.g, c.you, 1);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, você ganha 1 ponto de vida e compra uma carta.' }),
    ],
  }],
  rulings: { ...ATERRAGEM('teste: jogando um terreno, ganha 1 de vida e compra uma carta') },
});
