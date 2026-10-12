// Speed, Young Avenger
// Haste
// Whenever you cast a noncreature spell, you may pay {1}. When you do, target creature with haste can't be blocked this
// turn except by creatures with haste.
import { defineAbility, defineCard, hasKw, isCreature, keyword, mayPay, on, reflexive, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';

// CR 603.12: o alvo só é escolhido quando a habilidade reflexiva vai para a pilha, depois de pagar
const VELOZ = defineAbility('Speed, Young Avenger:veloz', triggered({ kind: 'event', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:blockedOnlyByKeyword', params: { kw: 'haste' } }]);
}, {
  targets: [t.creature((c, id) => hasKw(c.g, id, 'haste'), 'criatura alvo com ímpeto')],
  text: 'Quando você fizer isso, a criatura alvo com ímpeto não pode ser bloqueada neste turno exceto por criaturas com ímpeto.',
}));

export default defineCard({
  name: 'Speed, Young Avenger',
  faces: [{
    abilities: [
      keyword('haste'),
      triggered(on.youCast((c, id) => !isCreature(c.g, id)), function* (c) {
        if (yield* mayPay(c, c.you, '{1}', 'uma criatura com ímpeto ficar difícil de bloquear (Speed)')) reflexive(c, VELOZ.id!);
      }, { text: 'Sempre que você conjura uma mágica que não é de criatura, você pode pagar {1}. Quando você fizer isso, a criatura alvo com ímpeto não pode ser bloqueada neste turno exceto por criaturas com ímpeto.' }),
    ],
  }],
  rulings: {},
});