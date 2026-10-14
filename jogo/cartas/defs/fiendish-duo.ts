// Fiendish Duo
// First strike (This creature deals combat damage before creatures without first strike.)
// If a source would deal damage to an opponent, it deals double that damage to that player instead.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Fiendish Duo',
  faces: [{
    abilities: [
      ...keywords('first strike'),
      // CR 614.1a: substituição; vale para qualquer fonte, inclusive dos próprios oponentes
      staticAbility({
        rules: { damageDouble: (c, _fonte, alvo) => alvo.kind === 'player' && c.g.isOpponent(c.you, alvo.id) },
        text: 'Se uma fonte fosse causar dano a um oponente, em vez disso ela causa o dobro desse dano a esse jogador.',
      }),
    ],
  }],
  rulings: {},
});
