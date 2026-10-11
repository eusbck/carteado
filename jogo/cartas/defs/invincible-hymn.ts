// Invincible Hymn
// Count the number of cards in your library. Your life total becomes that number.
import { defineCard, gainLife, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Invincible Hymn',
  faces: [{
    spell: {
      *effect(c) {
        // ruling 2: contado uma vez, na resolução; ruling 3 (CR 119.5): você ganha ou perde a diferença
        const n = c.g.state.zones.library[c.you].length;
        const vida = c.g.state.players[c.you].life;
        if (n > vida) gainLife(c.g, c.you, n - vida, c.source);
        else if (n < vida) loseLife(c.g, c.you, vida - n, c.source);
      },
    },
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças não existe no jogo',
    2: 'teste: o seu total de vida passa a ser o número de cartas do seu grimório, ganhando a diferença',
    3: 'teste: com menos cartas no grimório do que vida, você perde a diferença',
  },
});