// Invisible Woman
// At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a 0/3 colorless Wall
// creature token with defender and reach.
// Whenever you attack, you may pay {R}{G}{W}{U}. When you do, target creature gets +1/+0 until end of turn for each
// creature you control and can't be blocked this turn.
import { allCreatures, controllerOf, createTokens, defineAbility, defineCard, mayPay, on, reflexive, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { noCombateSeConjurou } from '../quarteto.ts';

// CR 603.12: gatilho reflexivo — o alvo só é escolhido depois de pagar
const BONUS = defineAbility('Invisible Woman:bonus', triggered({ kind: 'batch', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id === null) return;
  // conta as suas criaturas na resolução
  const n = allCreatures(c.g).filter((x) => controllerOf(c.g, x) === c.you).length;
  untilEndOfTurn(c, [id], [{ k: 'pt', p: n, t: 0 }, { k: 'rule', id: 'rule:cantBeBlocked' }]);
}, { targets: [t.creature()], text: 'A criatura alvo recebe +1/+0 até o fim do turno para cada criatura que você controla e não pode ser bloqueada neste turno.' }));

export default defineCard({
  name: 'Invisible Woman',
  faces: [{
    abilities: [
      noCombateSeConjurou(function* (c) { yield* createTokens(c.g, c.you, 'Wall 0/3', 1); }, {
        text: 'No início do combate no seu turno, se você conjurou uma mágica que não é de criatura neste turno, crie uma ficha de criatura Wall 0/3 incolor com defensor e alcance.',
      }),
      triggered(on.youAttack(), function* (c) {
        if (yield* mayPay(c, c.you, '{R}{G}{W}{U}', 'dar +1/+0 por criatura sua a uma criatura alvo, que não pode ser bloqueada')) reflexive(c, BONUS.id!);
      }, { text: 'Sempre que você ataca, você pode pagar {R}{G}{W}{U}. Quando fizer isso, a criatura alvo recebe +1/+0 até o fim do turno para cada criatura que você controla e não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {},
});
