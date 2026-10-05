// Terra, Herald of Hope
// Trance — At the beginning of combat on your turn, mill two cards. Terra gains flying until end of turn.
// Whenever Terra deals combat damage to a player, you may pay {2}. When you do, return target creature card with power 3
// or less from your graveyard to the battlefield tapped.
import { and, defineAbility, defineCard, is, mayPay, mill, on, power, putOntoBattlefield, reflexive, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

const DEVOLVE = defineAbility('Terra, Herald of Hope:devolve', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you, tapped: true }], 'effect');
}, {
  targets: [t.card('graveyard', and(is.creature, (c, id) => power(c.g, id) <= 3), 'carta de criatura alvo com força 3 ou menos no seu cemitério')],
  text: 'Quando fizer isso, devolva a carta de criatura alvo com força 3 ou menos do seu cemitério ao campo virada.',
}));

export default defineCard({
  name: 'Terra, Herald of Hope',
  faces: [{
    abilities: [
      triggered(on.beginCombat('you'), function* (c) {
        yield* mill(c.g, c.you, 2);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Transe — No início do combate no seu turno, moa duas cartas. Terra ganha voar até o fim do turno.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        // CR 603.12: gatilho reflexivo depois de pagar
        if (yield* mayPay(c, c.you, '{2}', 'devolver uma criatura do cemitério')) reflexive(c, DEVOLVE.id!);
      }, { text: 'Sempre que Terra causa dano de combate a um jogador, você pode pagar {2}. Quando fizer isso, devolva a carta de criatura alvo com força 3 ou menos do seu cemitério ao campo virada.' }),
    ],
  }],
  rulings: {
    1: 'teste: o alvo é escolhido depois de pagar (gatilho reflexivo)',
  },
});
