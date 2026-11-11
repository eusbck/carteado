// Smuggler's Surprise
// Spree (Choose one or more additional costs.)
// + {2} — Mill four cards. You may put up to two creature and/or land cards from among the milled cards into your hand.
// + {4}{G} — You may put up to two creature cards from your hand onto the battlefield.
// + {1} — Creatures you control with power 4 or greater gain hexproof and indestructible until end of turn.
import {
  chooseItems, creaturesOf, defineCard, isCreature, isLand, mill, modal, moveObjects, nameOf, objItem, power, putOntoBattlefield, spree, untilEndOfTurn,
} from '../../motor/api.ts';

export default defineCard({
  name: "Smuggler's Surprise",
  faces: [{
    // farra (CR 702.172a): cada modo escolhido soma o seu custo; ruling 10: o valor de mana continua {G}
    additionalCosts: spree(['{2}', '{4}{G}', '{1}']),
    spell: {
      // rulings 5, 9: um ou mais modos, sem repetir; ruling 8: resolvem na ordem escrita
      modes: modal(1, 3, [
        {
          text: '+ {2} — Moa quatro cartas. Você pode colocar até duas cartas de criatura e/ou de terreno dentre elas na sua mão',
          *effect(c) {
            const g = c.g;
            const moidas = (yield* mill(g, c.you, 4)).filter((id) => g.state.objects[id]?.zone === 'graveyard' && (isCreature(g, id) || isLand(g, id)));
            if (!moidas.length) return;
            const esc = yield* chooseItems(g, c.you, "Smuggler's Surprise: até duas cartas de criatura ou de terreno moídas para a sua mão", moidas.map((id) => objItem(g, id, nameOf(g, id))), 0, 2);
            if (esc.length) yield* moveObjects(g, esc.map((x) => ({ id: Number(x), to: 'hand' as const })), 'effect');
          },
        },
        {
          text: '+ {4}{G} — Você pode colocar até duas cartas de criatura da sua mão no campo',
          *effect(c) {
            const g = c.g;
            const cands = g.state.zones.hand[c.you].filter((id) => isCreature(g, id));
            if (!cands.length) return;
            const esc = yield* chooseItems(g, c.you, "Smuggler's Surprise: até duas cartas de criatura da sua mão para o campo", cands.map((id) => objItem(g, id, nameOf(g, id))), 0, 2);
            if (esc.length) yield* putOntoBattlefield(g, esc.map((x) => ({ id: Number(x), controller: c.you })), 'effect');
          },
        },
        {
          text: '+ {1} — As criaturas com força 4 ou mais que você controla ganham resistência a magia e indestrutível até o fim do turno',
          *effect(c) {
            // ruling 2: só as que estão no campo agora (incluindo as postas pelo modo anterior)
            const ids = creaturesOf(c.g, c.you).filter((id) => power(c.g, id) >= 4);
            if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'hexproof' }, { k: 'addKeyword', kw: 'indestructible' }]);
          },
        },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.172a — sem pagar o custo de mana, os custos dos modos continuam (motor/stack.ts)',
    2: 'teste: os três modos: as criaturas postas no campo pelo segundo também ficam protegidas',
    3: 'não se aplica: o sinal de + não tem efeito no jogo',
    4: 'não se aplica: o sinal de + não tem efeito no jogo',
    5: 'teste: cada modo escolhido soma o seu custo',
    6: 'regra geral: CR 601.2b — os modos são escolhidos ao conjurar (motor/stack.ts)',
    7: 'regra geral: CR 700.2b — um modo com alvo só pode ser escolhido com alvo possível (motor/stack.ts)',
    8: 'teste: os três modos: as criaturas postas no campo pelo segundo também ficam protegidas',
    9: 'regra geral: CR 700.2 — o mesmo modo não pode ser escolhido duas vezes (motor/stack.ts chooseModes)',
    10: 'teste: cada modo escolhido soma o seu custo',
    11: 'regra geral: CR 608.2 — ninguém age no meio da resolução (motor/stack.ts)',
    12: 'regra geral: CR 707.10 — a cópia tem os mesmos modos (motor/stack.ts copySpell)',
    13: 'não se aplica: Smuggler\'s Surprise não tem alvos',
  },
});
