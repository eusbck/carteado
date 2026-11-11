// Co-Option Adjutant
// Artifact creatures you control have "Whenever this creature deals combat damage to a player, draw a card."
import { and, anthem, defineAbility, defineCard, draw, is, on, triggered } from '../../motor/api.ts';

const COMPRA = defineAbility('Co-Option Adjutant:compra', triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* draw(c.g, c.you, 1); },
  { text: 'Sempre que esta criatura causa dano de combate a um jogador, compre uma carta.' }));

export default defineCard({
  name: 'Co-Option Adjutant',
  faces: [{ abilities: [anthem(and(is.creature, is.artifact, is.yours), () => [{ k: 'addAbility', id: COMPRA.id! }], 'As criaturas-artefato que você controla têm "Sempre que esta criatura causa dano de combate a um jogador, compre uma carta."')] }],
  rulings: {},
});
