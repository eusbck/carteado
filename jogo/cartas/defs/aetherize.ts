// Aetherize
// Return all attacking creatures to their owner's hand.
import { defineCard, isCreature, returnToHand } from '../../motor/api.ts';

export default defineCard({
  name: "Aetherize",
  faces: [{ spell: { effect: function*(c) { yield* returnToHand(c.g, (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && c.g.state.objects[a.id]?.zone === 'battlefield' && isCreature(c.g, a.id)).map((a) => a.id)); } } }],
  rulings: {
    "1": "CR 506.4, 508.4: consulta os atacantes atuais, inclusive criaturas colocadas atacando e atacantes da etapa de fim de combate."
  },
});
