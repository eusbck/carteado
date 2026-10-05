// Sage's Reverie
// Enchant creature
// When this Aura enters, draw a card for each Aura you control that's attached to a creature.
// Enchanted creature gets +1/+1 for each Aura you control that's attached to a creature.
import { attachedGets, controlledBy, defineCard, draw, etb, isCreature, isSubtype, t } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

/** ruling 1: qualquer Aura sua presa a uma criatura, mesmo sem "encantar criatura" */
function aurasEmCriaturas(g: G, p: PlayerId): number {
  return controlledBy(g, p, (id) => {
    const alvo = g.state.objects[id].attachedTo;
    return isSubtype(g, id, 'Aura') && alvo != null && !!g.state.objects[alvo] && isCreature(g, alvo);
  }).length;
}

export default defineCard({
  name: "Sage's Reverie",
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      // ruling 2: conta na resolução (inclui esta, se ainda estiver no campo)
      etb(function* (c) {
        const n = aurasEmCriaturas(c.g, c.you);
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: 'Quando esta Aura entra, compre uma carta para cada Aura que você controla presa a uma criatura.' }),
      attachedGets((c) => {
        const n = aurasEmCriaturas(c.g, c.you);
        return [{ k: 'pt', p: n, t: n }];
      }, 'A criatura encantada recebe +1/+1 para cada Aura que você controla presa a uma criatura.'),
    ],
  }],
  rulings: {
    1: 'teste: conta Auras suas presas a criaturas de qualquer jogador',
    2: 'teste: na resolução, conta a própria Aura',
  },
});
