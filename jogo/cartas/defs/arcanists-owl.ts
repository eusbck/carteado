// Arcanist's Owl
// Flying
// When this creature enters, look at the top four cards of your library. You may reveal an artifact or enchantment card
// from among them and put it into your hand. Put the rest on the bottom of your library in a random order.
import { defineCard, etb, isType, keyword, moveObjects, nameOf } from '../../motor/api.ts';
import { olhaEPegaUma, restoNoFundo } from '../veiculos.ts';

export default defineCard({
  name: "Arcanist's Owl",
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 4);
        if (!topo.length) return;
        // você vê as quatro, mesmo sem nenhum artefato ou encantamento entre elas
        const escolhida = yield* olhaEPegaUma(c, topo, (id) => isType(c.g, id, 'Artifact') || isType(c.g, id, 'Enchantment'), "Arcanist's Owl (artefato ou encantamento)");
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        restoNoFundo(c.g, c.you, topo.filter((id) => id !== escolhida));
      }, { text: 'Quando esta criatura entra, olhe as quatro cartas do topo do seu grimório. Você pode revelar uma carta de artefato ou encantamento dentre elas e colocá-la na sua mão. Coloque o resto no fundo do grimório em ordem aleatória.' }),
    ],
  }],
  rulings: {},
});
