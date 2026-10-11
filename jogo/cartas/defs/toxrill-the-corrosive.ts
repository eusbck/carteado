// Toxrill, the Corrosive
// At the beginning of each end step, put a slime counter on each creature you don't control.
// Creatures you don't control get -1/-1 for each slime counter on them.
// Whenever a creature you don't control with a slime counter on it dies, create a 1/1 black Slug creature token.
// {U}{B}, Sacrifice a Slug: Draw a card.
import { activated, addCounters, allCreatures, and, anthem, controllerOf, cost, createTokens, defineCard, draw, is, not, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Toxrill, the Corrosive',
  faces: [{
    abilities: [
      triggered(on.endStep('each'), function* (c) {
        for (const id of allCreatures(c.g).filter((x) => controllerOf(c.g, x) !== c.you)) addCounters(c.g, { kind: 'obj', id }, 'slime', 1, c.you);
      }, { text: 'No início de cada etapa final, coloque um marcador de gosma em cada criatura que você não controla.' }),
      // ruling 1: vale para qualquer marcador de gosma, venha de onde vier. (Sempre devolve a modificação, mesmo com zero
      // marcadores: o motor descobre a camada da estática sondando-a com a própria fonte)
      anthem(and(is.creature, not(is.yours)), (_c, o) => { const n = o.counters.slime ?? 0; return [{ k: 'pt', p: -n, t: -n }]; }, 'As criaturas que você não controla recebem -1/-1 para cada marcador de gosma nelas.'),
      // ruling 2: morrendo por qualquer motivo
      triggered(on.dies((c, lki, old) => lki.controller !== c.you && (old.counters.slime ?? 0) > 0), function* (c) {
        yield* createTokens(c.g, c.you, 'Slug', 1);
      }, { text: 'Sempre que uma criatura que você não controla com um marcador de gosma morre, crie uma ficha de criatura Slug 1/1 preta.' }),
      activated([...cost('{U}{B}'), { k: 'sacrifice', n: 1, filter: is.subtype('Slug'), label: 'um Slug' }], function* (c) { yield* draw(c.g, c.you, 1); }, { text: '{U}{B}, Sacrifique um Slug: Compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: a estática lê os marcadores de gosma do objeto, não quem os colocou (cartas/defs/toxrill-the-corrosive.ts)',
    2: 'teste: na etapa final, cada criatura que você não controla recebe um marcador de gosma e -1/-1; morrendo, você cria um Slug',
    3: 'não se aplica: Sludge Monster não está nos decks',
  },
});
