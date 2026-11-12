// Samwise Gamgee
// Whenever another nontoken creature you control enters, create a Food token. (It's an artifact with "{2}, {T},
// Sacrifice this token: You gain 3 life.")
// Sacrifice three Foods: Return target historic card from your graveyard to your hand. (Artifacts, legendaries, and
// Sagas are historic.)
import { activated, and, createTokens, defineCard, is, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';
import { COMIDA } from '../tartarugas.ts';

export default defineCard({
  name: 'Samwise Gamgee',
  faces: [{
    abilities: [
      triggered(on.enters(and(is.creature, is.yours, is.nontoken, is.other)), function* (c) {
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, { text: 'Sempre que outra criatura que não é ficha que você controla entra, crie uma ficha Food.' }),
      activated('Sacrifice three Foods', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => ehHistorica(c.g, id), 'carta histórica alvo do seu cemitério')],
        text: 'Sacrifique três Foods: Devolva a carta histórica alvo do seu cemitério para a sua mão. (Artefatos, lendárias e Sagas são históricas.)',
      }),
    ],
  }],
  rulings: {
    1: COMIDA.naoComa,
    2: COMIDA.qualquer,
    3: COMIDA.tipo,
    4: COMIDA.qualquer,
    5: 'regra geral: CR 700.6 — histórica é a que é lendária, artefato ou Saga; ter mais de uma dessas qualidades não muda nada (cartas/jin.ts ehHistorica)',
    6: 'não se aplica: fala de "sempre que você conjura uma mágica histórica", que esta carta não tem',
    7: 'não se aplica: fala de "sempre que você conjura uma mágica histórica", que esta carta não tem',
    8: 'não se aplica: fala de "sempre que você conjura uma mágica histórica", que esta carta não tem',
  },
});
