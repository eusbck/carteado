// Type-03 Borg Vessel
// Artifact spells you cast cost {1} less to cast.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 7+.)
// 7+ | Flying
// Whenever you cast a spell, create a 1/1 colorless Borg artifact creature token.
// 5/5
import { defineAbility, defineCard, on, station, stationLevel, triggered } from '../../motor/api.ts';
import { artifactReduction } from '../artefatos.ts';
import { criaBorg } from '../borg.ts';

// a habilidade disparada está na faixa 7+ (CR 721.2): só existe com 7 ou mais marcadores de carga
const CONJURA = 'Type-03 Borg Vessel:conjura';
defineAbility(CONJURA, triggered(on.youCast(), function* (c) { yield* criaBorg(c, 1); }, { text: 'Sempre que você conjura uma mágica, crie uma ficha de criatura artefato Borg 1/1 incolor.' }));

export default defineCard({
  name: 'Type-03 Borg Vessel',
  faces: [{
    abilities: [
      artifactReduction(),
      station(),
      ...stationLevel(7, { creature: true, keywords: ['flying'], abilities: [CONJURA], text: 'Voar. Sempre que você conjura uma mágica, crie uma ficha de criatura artefato Borg 1/1 incolor. 5/5' }),
    ],
  }],
  rulings: {},
});
