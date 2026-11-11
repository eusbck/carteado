// Shuttlecraft Galileo
// Landfall — Whenever a land you control enters, create a 1/1 red Officer creature token.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 6+.)
// 6+ | Flying
// Whenever Shuttlecraft Galileo attacks, up to seven target attacking creatures gain flying until end of turn.
// 3/3 (no quadro da faixa 6+)
import { createTokens, defineAbility, defineCard, isAttacking, on, station, stationLevel, t, tgtsAll, triggered, untilEndOfTurn, upTo } from '../../motor/api.ts';

// CR 721.2: a linha depois de "6+ | Voar" está na mesma faixa
const ATACA = defineAbility('Shuttlecraft Galileo:ataca', triggered(on.selfAttacks(), function* (c) {
  const ids = tgtsAll(c, 0);
  if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'flying' }]);
}, {
  targets: [upTo(7, t.creature((c, id) => isAttacking(c.g, id), 'até sete criaturas atacantes alvo'))],
  text: 'Sempre que Shuttlecraft Galileo ataca, até sete criaturas atacantes alvo ganham voar até o fim do turno.',
}));

export default defineCard({
  name: 'Shuttlecraft Galileo',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) { yield* createTokens(c.g, c.you, 'Officer', 1); }, {
        text: 'Aterragem — Sempre que um terreno que você controla entra, crie uma ficha de criatura Officer 1/1 vermelha.',
      }),
      station(),
      // CR 721.2b: com 6 ou mais marcadores de carga, é criatura artefato 3/3 com voar e o gatilho de ataque
      ...stationLevel(6, { creature: true, keywords: ['flying'], abilities: [ATACA.id!], text: 'Voar. Sempre que Shuttlecraft Galileo ataca, até sete criaturas atacantes alvo ganham voar até o fim do turno. É uma criatura artefato 3/3.' }),
    ],
  }],
  rulings: {},
});
