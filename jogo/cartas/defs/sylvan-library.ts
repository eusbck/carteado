// Sylvan Library
// At the beginning of your draw step, you may draw two additional cards. If you do, choose two cards in your hand drawn
// this turn. For each of those cards, pay 4 life or put the card on top of your library.
import { chooseItems, defineCard, draw, loseLife, moveObjects, nameOf, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Sylvan Library',
  faces: [{
    abilities: [
      // ruling 1: a compra normal da etapa é ação baseada em turno e vem antes deste gatilho (CR 504.1, 504.2)
      triggered({ kind: 'step', step: 'draw', whose: 'you' }, function* (c) {
        const g = c.g;
        if (!(yield* yesNo(g, c.you, 'Sylvan Library: comprar duas cartas a mais?', 'Comprar duas', 'Não comprar'))) return;
        yield* draw(g, c.you, 2);
        // rulings 3, 6: qualquer carta comprada neste turno que ainda esteja na mão; se só houver uma, ela; se nenhuma, nada
        const compradas = (g.state.turnStats[c.you].cardsDrawnIds ?? []).filter((id) => g.state.objects[id]?.zone === 'hand' && g.state.zones.hand[c.you].includes(id));
        if (compradas.length === 0) return;
        const n = Math.min(2, compradas.length);
        // ruling 7: escolhe logo depois de comprar, sem chance de jogar as cartas
        const escolhidas = n === compradas.length ? compradas
          : (yield* chooseItems(g, c.you, 'Sylvan Library: escolha duas cartas compradas neste turno', compradas.map((id) => ({ id: String(id), label: nameOf(g, id), obj: id, card: { def: g.state.objects[id].def } })), n, n)).map(Number);
        for (const id of escolhidas) {
          const nome = nameOf(g, id);
          // CR 119.4: só pode pagar 4 de vida quem tem pelo menos 4
          const pode = g.state.players[c.you].life >= 4;
          if (pode && (yield* yesNo(g, c.you, `Sylvan Library: pagar 4 de vida para ficar com ${nome}?`, 'Pagar 4 de vida', 'Pôr no topo do grimório'))) {
            loseLife(g, c.you, 4, c.source);
          } else if (g.state.objects[id]?.zone === 'hand') {
            yield* moveObjects(g, [{ id, to: 'library', position: 'top' }], 'effect');
          }
        }
      }, { text: 'No início da sua etapa de compra, você pode comprar duas cartas a mais. Se fizer isso, escolha duas cartas na sua mão compradas neste turno. Para cada uma, pague 4 de vida ou ponha a carta no topo do seu grimório.' }),
    ],
  }],
  rulings: {
    1: 'teste: a compra normal vem antes; escolhendo comprar, paga 4 de vida ou devolve ao topo cada uma de duas cartas compradas',
    2: 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos; os do oponente resolvem antes (APNAP)',
    3: 'teste: a Forest que já estava na mão não pode ser escolhida (só as compradas no turno, turnStats.cardsDrawnIds)',
    4: 'regra geral: CR 603.3 — cada gatilho resolve inteiro antes do próximo',
    5: 'teste: sem 4 de vida, a carta escolhida volta para o topo',
    6: 'regra geral: CR 121.5, 614.6 — só contam as compras de fato (motor/actions.ts draw grava cardsDrawnIds; testes/regras-compradas-no-turno.test.ts); com uma só, ela é a escolhida',
    7: 'regra geral: CR 608.2 — ninguém age durante a resolução; as cartas são escolhidas logo depois de comprar',
  },
});
