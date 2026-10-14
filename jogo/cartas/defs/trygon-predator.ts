// Trygon Predator
// Flying
// Whenever this creature deals combat damage to a player, you may destroy target artifact or enchantment that player
// controls.
import { and, controllerOf, defineCard, destroy, is, keyword, nameOf, on, or, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Trygon Predator',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Trygon Predator: destruir ${nameOf(c.g, id)}?`)) yield* destroy(c.g, [id]);
      }, {
        targets: [t.permanent(and(or(is.artifact, is.enchantment), (c, id) => controllerOf(c.g, id) === (c.event?.player as PlayerId | undefined)), 'artefato ou encantamento alvo que esse jogador controla')],
        text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode destruir o artefato ou encantamento alvo que esse jogador controla.',
      }),
    ],
  }],
  rulings: {},
});
