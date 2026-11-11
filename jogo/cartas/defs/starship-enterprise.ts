// Starship Enterprise
// Landfall — Whenever a land you control enters, put four charge counters on Starship Enterprise.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 16+.)
// 16+ | Flying
// Whenever Starship Enterprise deals combat damage to a player, draw that many cards.
// 4/6 (no quadro da faixa 16+)
import { addCounters, defineAbility, defineCard, draw, on, station, stationLevel, triggered } from '../../motor/api.ts';

// CR 721.2: a linha depois de "16+ | Voar" está na mesma faixa
const DANO = defineAbility('Starship Enterprise:dano', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
  const n = c.event.amount as number;
  if (n > 0) yield* draw(c.g, c.you, n);
}, { text: 'Sempre que Starship Enterprise causa dano de combate a um jogador, compre essa quantidade de cartas.' }));

export default defineCard({
  name: 'Starship Enterprise',
  faces: [{
    abilities: [
      triggered(on.landfall(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 4, c.you);
      }, { text: 'Aterragem — Sempre que um terreno que você controla entra, coloque quatro marcadores de carga em Starship Enterprise.' }),
      station(),
      // CR 721.2b: com 16 ou mais marcadores de carga, é criatura artefato 4/6 com voar e o gatilho de dano
      ...stationLevel(16, { creature: true, keywords: ['flying'], abilities: [DANO.id!], text: 'Voar. Sempre que Starship Enterprise causa dano de combate a um jogador, compre essa quantidade de cartas. É uma criatura artefato 4/6.' }),
    ],
  }],
  rulings: {},
});
