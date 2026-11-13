// Mistblade Shinobi
// Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand
// tapped and attacking.)
// Whenever this creature deals combat damage to a player, you may return target creature that player controls to its
// owner's hand.
import { controllerOf, defineCard, nameOf, ninjutsu, on, returnToHand, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Mistblade Shinobi',
  faces: [{
    abilities: [
      ninjutsu('{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Mistblade Shinobi: devolver ${nameOf(c.g, id)} à mão do dono?`)) yield* returnToHand(c.g, [id]);
      }, {
        targets: [t.creature((c, id) => controllerOf(c.g, id) === (c.event?.player as PlayerId | undefined), 'criatura alvo que esse jogador controla')],
        text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode devolver a criatura alvo que esse jogador controla à mão do dono.',
      }),
    ],
  }],
  rulings: {},
});
