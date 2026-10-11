// Orcish Siegemaster
// Trample
// Other Orcs and Goblins you control have trample.
// Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the greatest power among creatures you
// control.
import { and, anthem, creaturesOf, defineCard, is, keyword, on, or, power, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Orcish Siegemaster',
  faces: [{
    abilities: [
      keyword('trample'),
      anthem(and(or(is.subtype('Orc'), is.subtype('Goblin')), is.yours, is.other), () => [{ k: 'addKeyword', kw: 'trample' }], 'Os outros Orcs e Goblins que você controla têm atropelar.'),
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        // X é lido na resolução, entre todas as suas criaturas (ele mesmo incluído)
        const x = creaturesOf(c.g, c.you).reduce((m, id) => Math.max(m, power(c.g, id)), 0);
        if (x > 0) untilEndOfTurn(c, [c.source], [{ k: 'pt', p: x, t: 0 }]);
      }, { text: 'Sempre que esta criatura ataca, ela recebe +X/+0 até o fim do turno, onde X é a maior força entre as criaturas que você controla.' }),
    ],
  }],
  rulings: {},
});
