// Glass-Cast Heart
// Whenever one or more Vampires you control attack, create a Blood token. (It's an artifact with "{1}, {T}, Discard a
// card, Sacrifice this token: Draw a card.")
// {B}, {T}, Pay 1 life: Create a 1/1 white and black Vampire creature token with lifelink.
// {B}{B}, {T}, Sacrifice this artifact and thirteen Blood tokens: Each opponent loses 13 life and you gain 13 life.
import { activated, and, controllerOf, cost, createTokens, defineCard, gainLife, is, isSubtype, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Glass-Cast Heart',
  faces: [{
    abilities: [
      // "um ou mais": um gatilho só por declaração de atacantes
      triggered(on.custom((e, c) => e.type === 'attackers' && e.attackers.some((a) => !!c.g.state.objects[a.obj] && controllerOf(c.g, a.obj) === c.you && isSubtype(c.g, a.obj, 'Vampire'))), function* (c) {
        yield* createTokens(c.g, c.you, 'Blood', 1);
      }, { text: 'Sempre que um ou mais Vampires que você controla atacam, crie uma ficha de Blood.' }),
      activated('{B}, {T}, Pay 1 life', function* (c) { yield* createTokens(c.g, c.you, 'Vampire 1/1', 1); }, {
        text: '{B}, {T}, Pague 1 de vida: Crie uma ficha de criatura Vampire 1/1 branca e preta com vínculo com a vida.',
      }),
      activated([...cost('{B}{B}, {T}, Sacrifice this artifact'), { k: 'sacrifice', n: 13, filter: and(is.token, is.subtype('Blood')), label: 'treze fichas de Blood' }], function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 13, c.source);
        gainLife(c.g, c.you, 13, c.source);
      }, { text: '{B}{B}, {T}, Sacrifique este artefato e treze fichas de Blood: Cada oponente perde 13 de vida e você ganha 13 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: ficha de Blood é qualquer ficha de artefato com o subtipo Blood, mesmo com outros subtipos (o custo filtra por ficha e subtipo)',
    2: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    3: 'não se aplica: nenhuma carta dos decks dispara ao sacrificar uma ficha de Blood',
  },
});
