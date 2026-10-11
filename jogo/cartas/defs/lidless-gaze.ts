// Lidless Gaze
// Exile the top card of each player's library. Until the end of your next turn, you may play those cards, and mana of any
// type can be spent to cast those spells.
// Flashback {2}{B}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { allowPlay, defineCard, exile, flashback } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Lidless Gaze',
  faces: [{
    altCosts: [flashback('{2}{B}{R}')],
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topos = c.g.playersInGame().flatMap((p) => (s.zones.library[p].length ? [s.zones.library[p][0]] : []));
        if (!topos.length) return;
        const exiladas = (yield* exile(c.g, topos)).filter((x): x is ObjId => x !== null && s.objects[x]?.zone === 'exile');
        // ruling 1: mana de qualquer tipo; até o fim do seu próximo turno
        allowPlay(c.g, c.you, c.source, exiladas, { kind: 'endOfYourNextTurn', player: c.you, afterTurn: s.turn.number }, { anyType: true });
      },
    },
  }],
  rulings: {
    1: 'teste: exila o topo do grimório de cada jogador; você pode jogá-los com mana de qualquer tipo até o fim do seu próximo turno',
    2: 'não se aplica: nenhuma carta dos decks tem custo de mana de neve',
  },
});
