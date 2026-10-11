// Queen Mother Ramonda
// When Queen Mother Ramonda enters, you become the monarch.
// As long as you're the monarch, creatures with power 2 or less can't attack you.
import { becomeMonarch, defineCard, etb, power, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Queen Mother Ramonda',
  faces: [{
    abilities: [
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando Queen Mother Ramonda entra, você se torna o monarca.' }),
      staticAbility({
        rules: { canAttack: (c, atacante, alvo) => !(c.g.state.monarch === c.you && alvo.kind === 'player' && alvo.id === c.you && power(c.g, atacante) <= 2) },
        text: 'Enquanto você for o monarca, as criaturas com força 2 ou menor não podem atacar você.',
      }),
    ],
  }],
  rulings: {},
});