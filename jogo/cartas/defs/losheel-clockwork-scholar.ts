// Losheel, Clockwork Scholar
// Prevent all combat damage that would be dealt to attacking artifact creatures you control.
// Whenever one or more artifact creatures you control enter, draw a card. This ability triggers only once each turn.
import { controllerOf, defineCard, draw, is, isCreature, isType, on, staticAbility, triggered, and } from '../../motor/api.ts';

export default defineCard({
  name: 'Losheel, Clockwork Scholar',
  faces: [{
    abilities: [
      staticAbility({
        rules: {
          preventsDamage: (c, alvo, _fonte, combate) => combate && alvo.kind === 'obj' && controllerOf(c.g, alvo.id) === c.you
            && isCreature(c.g, alvo.id) && isType(c.g, alvo.id, 'Artifact') && !!c.g.state.combat?.attackers.some((a) => a.id === alvo.id && !a.removed),
        },
        text: 'Previna todo o dano de combate que seria causado às criaturas-artefato atacantes que você controla.',
      }),
      triggered(on.entersBatch(and(is.creature, is.artifact, is.yours)), function* (c) { yield* draw(c.g, c.you, 1); }, {
        oncePerTurn: true,
        text: 'Sempre que uma ou mais criaturas-artefato que você controla entram, compre uma carta. Esta habilidade dispara só uma vez a cada turno.',
      }),
    ],
  }],
  rulings: {},
});
