// Mystic Remora
// Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it
// unless you pay its upkeep cost for each age counter on it.)
// Whenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.
import { cumulativeUpkeep, defineCard, lkiChars, on, triggered } from '../../motor/api.ts';
import { compraAMenosQuePague } from '../twitch.ts';

export default defineCard({
  name: 'Mystic Remora',
  faces: [{
    abilities: [
      // CR 702.24a (motor/controle.ts): rulings 1 e 2
      cumulativeUpkeep('{1}'),
      triggered(on.custom((e, c) => {
        if (e.type !== 'cast' || !c.g.isOpponent(c.you, e.player)) return false;
        return lkiChars(c.g, e.obj)?.types.includes('Creature') ? false : { jogador: e.player };
      }), function* (c) {
        yield* compraAMenosQuePague(c, c.event.jogador as number, '{4}', 'Mystic Remora');
      }, { text: 'Sempre que um oponente conjura uma mágica que não é de criatura, você pode comprar uma carta a menos que esse jogador pague {4}.' }),
    ],
  }],
  rulings: {
    1: 'teste: pagar a manutenção cumulativa é opcional e por inteiro; sem pagar, é sacrificada',
    2: 'teste: na sua manutenção ganha um marcador de idade e pede {1} por marcador',
  },
});
