// Kitt Kanto, Mayhem Diva
// When Kitt Kanto enters, create a 1/1 green and white Citizen creature token.
// At the beginning of combat on each player's turn, you may tap two untapped creatures you control. When you do, target
// creature that player controls gets +2/+2 and gains trample until end of turn. Goad that creature.
import { chooseItems, controllerOf, createTokens, creaturesOf, defineAbility, defineCard, etb, goad, nameOf, objItem, on, reflexive, t, tap, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

// CR 603.12: gatilho reflexivo — o alvo só é escolhido depois de virar as duas criaturas
const INCITA = defineAbility('Kitt Kanto, Mayhem Diva:incita', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id === null) return;
  untilEndOfTurn(c, [id], [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'trample' }]);
  goad(c.g, id, c.you);
}, {
  targets: [t.creature((c, id) => controllerOf(c.g, id) === (c.event?.jogador as PlayerId | undefined), 'criatura alvo que esse jogador controla')],
  text: 'A criatura alvo que esse jogador controla recebe +2/+2 e ganha atropelar até o fim do turno. Goade essa criatura.',
}));

export default defineCard({
  name: 'Kitt Kanto, Mayhem Diva',
  faces: [{
    abilities: [
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Citizen', 1); }, { text: 'Quando Kitt Kanto entra, crie uma ficha de criatura Citizen 1/1 verde e branca.' }),
      triggered(on.beginCombat('each'), function* (c) {
        const desviradas = creaturesOf(c.g, c.you).filter((id) => !c.g.state.objects[id].tapped);
        if (desviradas.length < 2) return;
        // escolhe nenhuma ou exatamente duas
        const esc = yield* chooseItems(c.g, c.you, 'Kitt Kanto: virar duas criaturas desviradas que você controla? (escolha duas, ou nenhuma)', desviradas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 2);
        if (esc.length !== 2) return;
        for (const id of esc.map(Number)) tap(c.g, id);
        reflexive(c, INCITA.id!, {}, { jogador: c.g.state.turn.active });
      }, { text: 'No início do combate no turno de cada jogador, você pode virar duas criaturas desviradas que você controla. Quando fizer isso, a criatura alvo que esse jogador controla recebe +2/+2 e ganha atropelar até o fim do turno. Goade essa criatura.' }),
    ],
  }],
  rulings: {},
});
