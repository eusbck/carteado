// Final Act
// Choose one or more —
// • Destroy all creatures. • Destroy all planeswalkers. • Destroy all battles. • Exile all graveyards.
// • Each opponent loses all counters.
import { allCreatures, defineCard, destroy, exile, isType, modal, permanentsMatching } from '../../motor/api.ts';

export default defineCard({
  name: 'Final Act',
  faces: [{
    spell: {
      // ruling 2: com vários modos, na ordem escrita
      modes: modal(1, 5, [
        { text: 'Destrua todas as criaturas', *effect(c) { yield* destroy(c.g, allCreatures(c.g)); } },
        { text: 'Destrua todos os planeswalkers', *effect(c) { yield* destroy(c.g, permanentsMatching(c.g, (id) => isType(c.g, id, 'Planeswalker'))); } },
        { text: 'Destrua todas as batalhas', *effect(c) { yield* destroy(c.g, permanentsMatching(c.g, (id) => isType(c.g, id, 'Battle'))); } },
        { text: 'Exile todos os cemitérios', *effect(c) { yield* exile(c.g, c.g.state.zones.graveyard.flat()); } },
        {
          text: 'Cada oponente perde todos os marcadores',
          // ruling 1: os marcadores que o jogador tem (veneno etc.)
          *effect(c) { for (const p of c.g.opponents(c.you)) c.g.state.players[p].counters = {}; c.g.bump(); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: cada oponente perde os marcadores de jogador (veneno)',
    2: 'teste: com vários modos, na ordem escrita',
  },
});
