// Thassa's Oracle
// When this creature enters, look at the top X cards of your library, where X is your devotion to blue. Put up to one
// of them on top of your library and the rest on the bottom of your library in a random order. If X is greater than or
// equal to the number of cards in your library, you win the game. (Each {U} in the mana costs of permanents you control
// counts toward your devotion to blue.)
import { chooseItems, defineCard, devotion, etb, nameOf, winGame } from '../../motor/api.ts';
import { restoNoFundo } from '../veiculos.ts';

export default defineCard({
  name: "Thassa's Oracle",
  faces: [{
    abilities: [etb(function* (c) {
      const g = c.g;
      // ruling 5: devoção contada na resolução, com o Oracle se ainda estiver no campo (CR 700.5)
      const x = devotion(g, c.you, ['U']);
      const topo = g.state.zones.library[c.you].slice(0, x);
      // ruling 1: com devoção 0, não olha nem move nada
      if (topo.length) {
        const [fica] = yield* chooseItems(g, c.you, "Thassa's Oracle: escolha até uma carta para ficar no topo (as outras vão para o fundo em ordem aleatória)", topo.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), 0, 1);
        restoNoFundo(g, c.you, topo.filter((id) => String(id) !== fica));
      }
      if (x >= g.state.zones.library[c.you].length) winGame(g, c.you, "Thassa's Oracle");
    }, { text: 'Quando esta criatura entra, olhe as X cartas do topo do seu grimório, onde X é a sua devoção ao azul. Coloque até uma delas no topo e o resto no fundo em ordem aleatória. Se X for maior ou igual ao número de cartas no seu grimório, você vence o jogo.' })],
  }],
  rulings: {
    1: 'teste: com o grimório vazio, você vence o jogo',
    2: 'teste: a devoção conta os símbolos azuis; genérico não conta',
    3: 'regra geral: CR 700.5 — só os custos de mana contam (motor/cedh.ts devotion)',
    4: 'teste: a devoção conta os símbolos azuis; genérico não conta',
    5: 'teste: com devoção menor que o grimório, olha X cartas, deixa uma no topo e não vence',
    6: 'regra geral: CR 700.5 — conta os permanentes que você controla, inclusive Auras presas a permanentes de outros (motor/cedh.ts devotion)',
  },
});
