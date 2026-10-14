// Metropolis Reformer
// Flying, vigilance
// You have hexproof.
// Whenever this creature is dealt damage, you gain that much life.
import { defineCard, gainLife, keywords, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Metropolis Reformer',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      // CR 702.11c: o jogador com resistência a magia não pode ser alvo do que os oponentes controlam
      staticAbility({ rules: { playerHexproof: (c, p) => p === c.you }, text: 'Você tem resistência a magia.' }),
      // o dano simultâneo de várias fontes é um disparo só, com o total (CR 603.2c)
      triggered(on.batch((evs, c) => {
        const total = evs.reduce((n, e) => n + (e.type === 'damage' && e.target.kind === 'obj' && e.target.id === c.source ? e.amount : 0), 0);
        return total > 0 ? { total } : false;
      }), function* (c) {
        gainLife(c.g, c.you, c.event.total as number, c.source);
      }, { text: 'Sempre que esta criatura sofre dano, você ganha essa quantidade de vida.' }),
    ],
  }],
  rulings: {},
});
