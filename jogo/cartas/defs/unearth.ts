// Unearth
// Return target creature card with mana value 3 or less from your graveyard to the battlefield.
// Cycling {2} ({2}, Discard this card: Draw a card.)
import { chars, cycling, defineCard, manaValue, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Unearth',
  faces: [{
    abilities: [cycling('{2}')],
    spell: {
      // ruling 1: {X} vale 0 no cemitério (CR 107.3)
      targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.includes('Creature') && manaValue(c.g, id) <= 3, 'carta de criatura alvo com valor de mana 3 ou menos no seu cemitério')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect'); },
    },
  }],
  rulings: { 1: 'regra geral: CR 107.3 — {X} vale 0 fora da pilha (motor/chars.ts)' },
});
