// Christine Chapel, Combat Medic
// Strange new worlds — When Christine Chapel enters, you gain life equal to the number of differently named lands you
// control.
// Whenever you gain life, put two +1/+1 counters on Christine Chapel.
import { addCounters, defineCard, etb, gainLife, on, triggered } from '../../motor/api.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';

export default defineCard({
  name: 'Christine Chapel, Combat Medic',
  faces: [{
    abilities: [
      etb(function* (c) {
        const n = terrenosComNomesDiferentes(c.g, c.you);
        if (n > 0) gainLife(c.g, c.you, n, c.source);
      }, { text: 'Strange new worlds — Quando Christine Chapel entra, você ganha pontos de vida iguais ao número de terrenos com nomes diferentes que você controla.' }),
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 2, c.you);
      }, { text: 'Sempre que você ganha vida, coloque dois marcadores +1/+1 em Christine Chapel.' }),
    ],
  }],
  rulings: {},
});
