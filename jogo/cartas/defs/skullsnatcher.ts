// Skullsnatcher
// Ninjutsu {B} ({B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand
// tapped and attacking.)
// Whenever this creature deals combat damage to a player, exile up to two target cards from that player's graveyard.
import { defineCard, exile, ninjutsu, on, t, tgtsAll, triggered, upTo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Skullsnatcher',
  faces: [{
    abilities: [
      ninjutsu('{B}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const ids = tgtsAll(c, 0);
        if (ids.length) yield* exile(c.g, ids);
      }, {
        // ruling 1: zero, uma ou duas cartas
        targets: [upTo(2, t.card('graveyard', (c, id) => c.g.state.objects[id]?.owner === (c.event?.player as PlayerId | undefined), 'até duas cartas alvo do cemitério desse jogador', 'any'))],
        text: 'Sempre que esta criatura causa dano de combate a um jogador, exile até duas cartas alvo do cemitério desse jogador.',
      }),
    ],
  }],
  rulings: { 1: 'teste: exila até duas cartas só do cemitério do jogador atingido' },
});
