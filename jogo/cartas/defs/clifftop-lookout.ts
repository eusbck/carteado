// Clifftop Lookout
// Reach
// When this creature enters, reveal cards from the top of your library until you reveal a land card. Put that card onto
// the battlefield tapped and the rest on the bottom of your library in a random order.
import { defineCard, etb, isLand, keyword, nameOf, putOntoBattlefield } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Clifftop Lookout',
  faces: [{
    abilities: [
      keyword('reach'),
      etb(function* (c) {
        const s = c.g.state;
        const lib = s.zones.library[c.you];
        const i = lib.findIndex((id) => isLand(c.g, id));
        // ruling 1: sem terreno, revela o grimório inteiro e o põe em ordem aleatória
        const reveladas = i < 0 ? [...lib] : lib.slice(0, i + 1);
        c.g.log(`${s.players[c.you].name} revela ${reveladas.map((id) => nameOf(c.g, id)).join(', ') || 'nada'}.`, { rule: '701.20' });
        if (i >= 0) yield* putOntoBattlefield(c.g, [{ id: lib[i], controller: c.you, tapped: true }], 'effect');
        const resto = shuffle(s.rng, reveladas.filter((id) => s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      }, { text: 'Quando esta criatura entra, revele cartas do topo do seu grimório até revelar uma carta de terreno. Coloque-a no campo virada e as outras no fundo do grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem terreno no grimório, nada entra e as cartas continuam no grimório',
  },
});
