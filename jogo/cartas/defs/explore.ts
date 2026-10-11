// Explore
// You may play an additional land this turn.
// Draw a card.
import { defineCard, draw, extraLandThisTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Explore',
  faces: [{
    spell: {
      *effect(c) {
        // rulings 1-3: soma com outros efeitos; fora do seu turno não há terreno para jogar; o terreno é jogado depois,
        // na sua fase principal, pelas regras normais
        extraLandThisTurn(c.g, c.you);
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: dois Explores no mesmo turno deixam jogar três terrenos',
    2: 'teste: CR 305.2: a permissão de terreno adicional só vale para o jogador ativo',
    3: 'teste: você pode jogar um terreno adicional neste turno e compra uma carta',
  },
});