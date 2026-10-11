// The Frightful Four
// Menace
// Whenever an opponent casts their first noncreature spell each turn, that player loses life equal to that spell's mana
// value.
import { defineCard, isCreature, keyword, loseLife, manaValue, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'The Frightful Four',
  faces: [{
    abilities: [
      keyword('menace'),
      // a contagem do turno já inclui a mágica que acabou de ser conjurada; o valor de mana é lido ao disparar
      triggered(on.custom((e, c) => (e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)
        && (c.g.state.turnStats[e.player]?.noncreatureSpellsCast ?? 0) === 1 ? { jogador: e.player, valor: manaValue(c.g, e.obj) } : false)), function* (c) {
        const n = c.event.valor as number;
        if (n > 0) loseLife(c.g, c.event.jogador as PlayerId, n, c.source);
      }, { text: 'Sempre que um oponente conjura a primeira mágica que não é de criatura dele em cada turno, esse jogador perde vida igual ao valor de mana dessa mágica.' }),
    ],
  }],
  rulings: {},
});
