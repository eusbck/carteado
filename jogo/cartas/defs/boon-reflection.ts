// Boon Reflection
// If you would gain life, you gain twice that much life instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Boon Reflection',
  faces: [{
    abilities: [
      // ruling 1: dois Boon Reflections quadruplicam (cada um dobra); ruling 3: só o ganho de vida de quem o controla
      staticAbility({ rules: { lifeGainDouble: (c, p) => p === c.you }, text: 'Se você fosse ganhar vida, em vez disso você ganha o dobro.' }),
    ],
  }],
  rulings: {
    1: 'teste: dois Boon Reflections quadruplicam o ganho',
    2: 'teste: quando o total de vida "passa a ser" um número maior, a diferença ganha também é dobrada',
    3: 'teste: você ganha o dobro; o oponente ganha o normal',
  },
});