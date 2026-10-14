// Weatherlight
// Flying
// Whenever Weatherlight deals combat damage to a player, look at the top five cards of your library. You may reveal a
// historic card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.
// (Artifacts, legendaries, and Sagas are historic.)
// Crew 3
import { chooseItems, crew, defineCard, keyword, moveObjects, nameOf, on, triggered } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';
import { ehHistorica } from '../jin.ts';
import { restoNoFundo } from '../veiculos.ts';

export default defineCard({
  name: 'Weatherlight',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 5);
        if (!topo.length) return;
        // ruling 1: histórica é artefato, lendária ou Saga (CR 700.6)
        const itens: ChoiceItem[] = topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: !ehHistorica(c.g, id) }));
        const esc = itens.some((i) => !i.disabled)
          ? yield* chooseItems(c.g, c.you, 'Weatherlight: você pode revelar uma carta histórica e colocá-la na sua mão', itens, 0, 1)
          : [];
        const escolhida = esc.length ? Number(esc[0]) : null;
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
