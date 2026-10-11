// Voice of Resurgence
// Whenever an opponent casts a spell during your turn and when this creature dies, create a green and white Elemental
// creature token with "This token's power and toughness are each equal to the number of creatures you control."
import { createTokens, defineCard, on, triggered } from '../../motor/api.ts';
import type { EffectFn } from '../../motor/defs.ts';

const criaElemental: EffectFn = function* (c) { yield* createTokens(c.g, c.you, 'Elemental verde e branco', 1); };

export default defineCard({
  name: 'Voice of Resurgence',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica que a disparou, mesmo que ela seja anulada
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player) && c.g.state.turn.active === c.you), criaElemental, {
        text: 'Sempre que um oponente conjura uma mágica durante o seu turno, crie uma ficha de criatura Elemental verde e branca com "A força e a resistência desta ficha são iguais ao número de criaturas que você controla."',
      }),
      triggered(on.selfDies(), criaElemental, { text: 'Quando esta criatura morre, crie uma ficha de criatura Elemental verde e branca com "A força e a resistência desta ficha são iguais ao número de criaturas que você controla."' }),
    ],
  }],
  rulings: {
    1: 'teste: um oponente conjurando uma mágica no seu turno cria o Elemental antes de a mágica resolver',
    2: 'teste: a força e a resistência do Elemental acompanham o número de criaturas que você controla, contando ele mesmo',
  },
});