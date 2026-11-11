// U.S.S. Defiant, Mirror Migrant
// Flash
// When U.S.S. Defiant enters, it and up to one target creature you control phase out. (Treat them and anything
// attached to them as though they don't exist until your next turn.)
// Station
// 8+ | Flying
// 5/5 (no quadro da faixa 8+)
import { defineCard, etb, is, keyword, phaseOut, station, stationLevel, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'U.S.S. Defiant, Mirror Migrant',
  faces: [{
    abilities: [
      keyword('flash'),
      // CR 702.26: saem de fase e voltam na etapa de desvirar do controlador (o seu próximo turno)
      etb(function* (c) {
        const ids = [c.source, tgt(c)].filter((id): id is number => id !== null && c.g.state.objects[id]?.zone === 'battlefield');
        if (ids.length) phaseOut(c.g, ids);
      }, {
        targets: [upTo(1, t.creature(is.yours, 'até uma criatura alvo que você controla'))],
        text: 'Quando U.S.S. Defiant entra, ela e até uma criatura alvo que você controla saem de fase. (Trate-as, e o que estiver preso a elas, como se não existissem até o seu próximo turno.)',
      }),
      station(),
      ...stationLevel(8, { creature: true, keywords: ['flying'], text: 'Voar. É uma criatura artefato 5/5.' }),
    ],
  }],
  rulings: {},
});
