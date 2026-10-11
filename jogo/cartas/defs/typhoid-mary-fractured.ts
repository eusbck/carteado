// Typhoid Mary, Fractured
// Whenever Typhoid Mary attacks, choose one at random. If you discarded a card this turn, you choose one instead.
// • Mary — Create a Treasure token.
// • Typhoid Mary — Draw a card.
// • Bloody Mary — Each opponent loses 2 life and you gain 2 life.
import { chooseItems, createTokens, defineCard, draw, gainLife, loseLife, on, triggered } from '../../motor/api.ts';
import { int } from '../../motor/rng.ts';

const MODOS = [
  'Mary — Crie uma ficha de Treasure',
  'Typhoid Mary — Compre uma carta',
  'Bloody Mary — Cada oponente perde 2 de vida e você ganha 2 de vida',
];

export default defineCard({
  name: 'Typhoid Mary, Fractured',
  faces: [{
    abilities: [
      // nenhum modo tem alvo: o modo é definido na resolução, sorteado ou escolhido por você se descartou neste turno
      triggered(on.selfAttacks(), function* (c) {
        const s = c.g.state;
        let modo: number;
        if ((s.turnStats[c.you]?.cardsDiscarded ?? 0) > 0) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Typhoid Mary: escolha um modo', MODOS.map((label, i) => ({ id: String(i), label })), 1, 1);
          modo = Number(esc);
        } else {
          modo = int(s.rng, MODOS.length);
          c.g.log(`Typhoid Mary: modo sorteado — ${MODOS[modo]}.`);
        }
        if (modo === 0) yield* createTokens(c.g, c.you, 'Treasure', 1);
        else if (modo === 1) yield* draw(c.g, c.you, 1);
        else {
          for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 2, c.source);
          gainLife(c.g, c.you, 2, c.source);
        }
      }, { text: 'Sempre que Typhoid Mary ataca, escolha um ao acaso. Se você descartou uma carta neste turno, você escolhe. • Mary — Crie uma ficha de Treasure. • Typhoid Mary — Compre uma carta. • Bloody Mary — Cada oponente perde 2 de vida e você ganha 2 de vida.' }),
    ],
  }],
  rulings: {},
});
