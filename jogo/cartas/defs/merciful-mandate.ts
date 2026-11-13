// Merciful Mandate
// Untap all creatures you control. If it's a combat phase, you may end the combat phase. (Remove all attackers and
// blockers from combat. Exile all spells and abilities from the stack, including this spell.)
import { creaturesOf, defineCard, endTheCombatPhase, untap, yesNo } from '../../motor/api.ts';

const COMBATE = ['beginCombat', 'declareAttackers', 'declareBlockers', 'firstStrikeDamage', 'combatDamage', 'endCombat'];

export default defineCard({
  name: 'Merciful Mandate',
  faces: [{
    spell: {
      *effect(c) {
        for (const id of creaturesOf(c.g, c.you)) untap(c.g, id);
        // CR 724.2: encerrar a fase de combate (o motor exila a pilha, inclusive esta mágica)
        if (!COMBATE.includes(c.g.state.turn.step)) return;
        if (yield* yesNo(c.g, c.you, 'Merciful Mandate: encerrar a fase de combate?', 'Encerrar', 'Não encerrar')) yield* endTheCombatPhase(c.g);
      },
    },
  }],
  rulings: {},
});
