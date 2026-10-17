// Weatherlight
// Flying
// Whenever Weatherlight deals combat damage to a player, look at the top five cards of your library. You may reveal a
// historic card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.
// (Artifacts, legendaries, and Sagas are historic.)
// Crew 3
import { crew, defineCard, keyword, moveObjects, nameOf, on, triggered } from '../../motor/api.ts';
import { ehHistorica } from '../jin.ts';
import { olhaEPegaUma, restoNoFundo } from '../veiculos.ts';

export default defineCard({
  name: 'Weatherlight',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 5);
        if (!topo.length) return;
        // ruling 1: histórica é artefato, lendária ou Saga (CR 700.6); você vê as cinco, mesmo sem nenhuma histórica
        const escolhida = yield* olhaEPegaUma(c, topo, (id) => ehHistorica(c.g, id), 'Weatherlight (carta histórica)');
        if (escolhida !== null) {
          c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
          yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
        }
        restoNoFundo(c.g, c.you, topo.filter((id) => id !== escolhida));
      }, { text: 'Sempre que Weatherlight causa dano de combate a um jogador, olhe as cinco cartas do topo do seu grimório. Você pode revelar uma carta histórica dentre elas e colocá-la na sua mão. Coloque o resto no fundo em ordem aleatória.' }),
      crew(3),
    ],
  }],
  rulings: {
    1: 'teste: ao causar dano de combate, pega uma carta histórica entre as cinco do topo',
  },
});
