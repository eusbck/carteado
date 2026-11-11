// Innocent Blood
// Each player sacrifices a creature of their choice.
import { defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Innocent Blood',
  faces: [{ spell: { *effect(c) { yield* eachSacrifices(c, c.g.playersInGame(), (id) => isCreature(c.g, id)); } } }],
  rulings: { 1: 'regra geral: CR 101.4 — na ordem de turno cada um escolhe, e todos sacrificam ao mesmo tempo (motor/efeitos.ts eachSacrifices)' },
});
