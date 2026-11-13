// Bloodthirsty Conqueror
// Flying, deathtouch
// Whenever an opponent loses life, you gain that much life. (Damage causes loss of life.)
import { defineCard, gainLife, keywords, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodthirsty Conqueror',
  faces: [{
    abilities: [
      ...keywords('flying', 'deathtouch'),
      // ruling 1: dano e pagar vida também são perda de vida
      triggered(on.custom((e, c) => (e.type === 'lifeLoss' && c.g.isOpponent(c.you, e.player) && e.amount > 0 ? { n: e.amount } : false)), function* (c) {
        gainLife(c.g, c.you, c.event.n as number, c.source);
      }, { text: 'Sempre que um oponente perde vida, você ganha essa quantidade de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: dano a um oponente faz você ganhar essa quantidade de vida',
    2: 'regra geral: CR 704.5a — as ações de estado vêm antes do gatilho (motor/sba.ts)',
  },
});
