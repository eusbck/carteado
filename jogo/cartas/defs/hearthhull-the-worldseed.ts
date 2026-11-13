// Hearthhull, the Worldseed
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as a
// sorcery. It's an artifact creature at 8+.)
// 2+ | {1}, {T}, Sacrifice a land: Draw two cards. You may play an additional land this turn.
// 8+ | Flying, vigilance, haste
// Whenever you sacrifice a land, each opponent loses 2 life.
// 6/7 (no quadro da faixa 8+)
import { activated, defineAbility, defineCard, draw, extraLandThisTurn, loseLife, station, stationLevel, triggered } from '../../motor/api.ts';
import { voceSacrificaTerreno } from '../terras.ts';

const SACRIFICA = defineAbility('Hearthhull, the Worldseed:sacrifica', activated('{1}, {T}, Sacrifice a land', function* (c) {
  yield* draw(c.g, c.you, 2);
  // rulings 1-2: soma com os outros efeitos; só vale neste turno (e terreno só se joga no próprio turno)
  extraLandThisTurn(c.g, c.you);
}, { text: '{1}, {T}, Sacrifique um terreno: Compre duas cartas. Você pode jogar um terreno adicional neste turno.' }));

// CR 721.2: a linha depois de "8+ | Voar, vigilância, ímpeto" está na mesma faixa
const PERDE = defineAbility('Hearthhull, the Worldseed:perde', triggered(voceSacrificaTerreno(), function* (c) {
  for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 2, c.source);
}, { text: 'Sempre que você sacrifica um terreno, cada oponente perde 2 pontos de vida.' }));

export default defineCard({
  name: 'Hearthhull, the Worldseed',
  faces: [{
    abilities: [
      station(),
      ...stationLevel(2, { abilities: [SACRIFICA.id!], text: '{1}, {T}, Sacrifique um terreno: Compre duas cartas. Você pode jogar um terreno adicional neste turno.' }),
      ...stationLevel(8, {
        creature: true, keywords: ['flying', 'vigilance', 'haste'], abilities: [PERDE.id!],
        text: 'Voar, vigilância, ímpeto. Sempre que você sacrifica um terreno, cada oponente perde 2 pontos de vida. É uma criatura artefato 6/7.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com Exploration, a habilidade de 2+ deixa jogar três terrenos no turno',
    2: 'regra geral: CR 305.2 e 505.6b — terreno só se joga na sua fase principal (motor/priority.ts landPlayOptions)',
  },
});
