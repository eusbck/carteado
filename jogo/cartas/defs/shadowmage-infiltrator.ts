// Shadowmage Infiltrator
// Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)
// Whenever this creature deals combat damage to a player, you may draw a card.
import { chars, defineCard, draw, keyword, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Shadowmage Infiltrator',
  faces: [{
    abilities: [
      keyword('fear'),
      // CR 702.36b: medo — só criaturas artefato e/ou pretas a bloqueiam
      staticAbility({
        rules: {
          canBeBlockedBy: (c, atacante, bloqueador) => {
            if (atacante !== c.source) return true;
            const b = chars(c.g, bloqueador);
            return b.types.includes('Artifact') || b.colors.includes('B');
          },
        },
        text: 'Medo (esta criatura não pode ser bloqueada, exceto por criaturas artefato e/ou criaturas pretas).',
      }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Shadowmage Infiltrator: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {},
});
