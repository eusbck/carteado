// Eternal Taskmaster
// This creature enters tapped.
// Whenever this creature attacks, you may pay {2}{B}. If you do, return target creature card from your graveyard to
// your hand.
import { defineCard, entersTapped, is, mayPay, moveObjects, on, t, tgt, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Eternal Taskmaster',
  faces: [{
    abilities: [
      entersTapped(),
      // o alvo é escolhido ao pôr o gatilho na pilha; o pagamento é na resolução (CR 603.3d, 608.2g)
      triggered(on.selfAttacks(), function* (c) {
        if (tgt(c) === null) return;
        // ruling 1: um só pagamento por resolução
        if (!(yield* mayPay(c, c.you, '{2}{B}', 'devolver a carta de criatura alvo para a mão'))) return;
        const id = tgt(c);
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', is.creature, 'carta de criatura alvo no seu cemitério')],
        text: 'Sempre que esta criatura ataca, você pode pagar {2}{B}. Se fizer isso, devolva a carta de criatura alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: { 1: 'teste: paga {2}{B} uma vez e devolve uma carta' },
});
