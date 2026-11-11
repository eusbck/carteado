// Class-4 Tactical Cube
// When this Spacecraft enters, create two 1/1 colorless Borg artifact creature tokens.
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as
// a sorcery. It's an artifact creature at 7+.)
// 7+ | Flying
// Artifact creatures you control get +1/+1.
// 4/4
import { defineCard, etb, station, stationLevel } from '../../motor/api.ts';
import { artefatosRecebem, criaBorg } from '../borg.ts';

export default defineCard({
  name: 'Class-4 Tactical Cube',
  faces: [{
    abilities: [
      etb(function* (c) { yield* criaBorg(c, 2); }, { text: 'Quando esta Espaçonave entra, crie duas fichas de criatura artefato Borg 1/1 incolor.' }),
      station(),
      // CR 721.2: o +1/+1 está na faixa 7+, junto com voar
      ...stationLevel(7, {
        creature: true, keywords: ['flying'],
        statics: [artefatosRecebem([{ k: 'pt', p: 1, t: 1 }], '7+ | As criaturas artefato que você controla recebem +1/+1.')],
        text: 'Voar. As criaturas artefato que você controla recebem +1/+1. 4/4',
      }),
    ],
  }],
  rulings: {},
});
