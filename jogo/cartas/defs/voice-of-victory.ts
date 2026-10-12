// Voice of Victory
// Mobilize 2 (Whenever this creature attacks, create two tapped and attacking 1/1 red Warrior creature tokens. Sacrifice
// them at the beginning of the next end step.)
// Your opponents can't cast spells during your turn.
import { defineCard, mobilize, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Voice of Victory',
  faces: [{
    abilities: [
      mobilize(2),
      staticAbility({
        rules: { cantCastSpells: (c, p) => c.g.state.turn.active === c.you && c.g.isOpponent(c.you, p) },
        text: 'Os seus oponentes não podem conjurar mágicas durante o seu turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.181a — você escolhe quem cada ficha Warrior ataca (motor/criaturas.ts mobilize)',
    2: 'regra geral: CR 508.4 — as fichas entram atacando sem terem sido declaradas: gatilhos de atacar não disparam (motor/actions.ts putOntoBattlefield)',
  },
});