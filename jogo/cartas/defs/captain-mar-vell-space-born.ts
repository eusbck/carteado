// Captain Mar-Vell, Space-Born
// Flying, vigilance
// Cosmic Awareness — As long as an opponent has cast a spell this turn, you may cast spells as though they had flash.
import { defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Captain Mar-Vell, Space-Born',
  faces: [{
    abilities: [
      ...keywords('flying', 'vigilance'),
      staticAbility({
        rules: { castAsThoughFlash: (c, jogador) => jogador === c.you && c.g.playersInGame().some((p) => c.g.isOpponent(c.you, p) && c.g.state.turnStats[p].spellsCast > 0) },
        text: 'Cosmic Awareness — Enquanto um oponente tiver conjurado uma mágica neste turno, você pode conjurar mágicas como se tivessem lampejo.',
      }),
    ],
  }],
  rulings: {},
});