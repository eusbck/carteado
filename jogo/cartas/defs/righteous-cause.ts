// Righteous Cause
// Whenever a creature attacks, you gain 1 life.
import { defineCard, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Righteous Cause',
  faces: [{
    abilities: [
      // um gatilho por criatura declarada atacante, de qualquer jogador
      triggered(on.custom((e) => (e.type === 'attackers' ? e.attackers.map((a) => ({ atacante: a.obj })) : false)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura ataca, você ganha 1 de vida.' }),
    ],
  }],
  rulings: {},
});