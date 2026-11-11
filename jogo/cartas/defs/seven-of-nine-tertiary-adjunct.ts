// Seven of Nine, Tertiary Adjunct
// That Is Irrelevant — {T}: Draw a card, then discard a card. When you discard a nonland card this way, put two charge
// counters on up to one target artifact.
import { activated, addCounters, defineAbility, defineCard, discard, draw, isLand, reflexive, t, tgt, triggered, upTo } from '../../motor/api.ts';

// gatilho reflexivo (CR 603.12): o alvo é escolhido quando ele dispara, depois do descarte
const REFLEXIVO = 'Seven of Nine, Tertiary Adjunct:reflexivo';
defineAbility(REFLEXIVO, triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) addCounters(c.g, { kind: 'obj', id }, 'charge', 2, c.you);
}, { targets: [upTo(1, t.artifact())], text: 'Quando você descarta uma carta que não é terreno assim, coloque dois marcadores de carga em até um artefato alvo.' }));

export default defineCard({
  name: 'Seven of Nine, Tertiary Adjunct',
  faces: [{
    abilities: [
      activated('{T}', function* (c) {
        yield* draw(c.g, c.you, 1);
        const [d] = yield* discard(c.g, c.you, 1);
        if (d !== undefined && !isLand(c.g, d)) reflexive(c, REFLEXIVO);
      }, { text: 'Isso É Irrelevante — {T}: Compre uma carta e depois descarte uma carta. Quando você descartar uma carta que não é terreno assim, coloque dois marcadores de carga em até um artefato alvo.' }),
    ],
  }],
  rulings: {},
});
