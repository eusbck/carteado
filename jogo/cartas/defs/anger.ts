// Anger
// Haste
// As long as this card is in your graveyard and you control a Mountain, creatures you control have haste.
import { controlledBy, defineCard, isCreature, isSubtype, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Anger',
  faces: [{
    abilities: [
      keyword('haste'),
      staticAbility({
        zones: ['graveyard'],
        condition: (c) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Mountain')).length > 0,
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'haste' }],
        text: 'Enquanto esta carta estiver no seu cemitério e você controlar uma Mountain, as criaturas que você controla têm ímpeto.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 613.7e — o registro de data e hora é o de quando a carta chegou ao cemitério' },
});
