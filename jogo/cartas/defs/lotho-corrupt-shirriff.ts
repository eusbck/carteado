// Lotho, Corrupt Shirriff
// Whenever a player casts their second spell each turn, you lose 1 life and create a Treasure token. (It's an artifact
// with "{T}, Sacrifice this token: Add one mana of any color.")
import { createTokens, defineCard, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Lotho, Corrupt Shirriff',
  faces: [{
    abilities: [
      // ruling 1: as mágicas conjuradas antes de Lotho no turno contam (TurnStats.spellsCast)
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.state.turnStats[e.player].spellsCast === 2), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que um jogador conjura a segunda mágica dele num turno, você perde 1 ponto de vida e cria uma ficha Treasure.' }),
    ],
  }],
  rulings: {
    1: 'teste: o próprio Lotho conta como a primeira mágica; a segunda dispara',
  },
});
