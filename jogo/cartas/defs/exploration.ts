// Exploration
// You may play an additional land on each of your turns.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Exploration',
  faces: [{
    abilities: [
      // CR 305.2: soma com os outros efeitos de terreno adicional (ruling 1)
      staticAbility({
        rules: { extraLandPlays: (c, jogador) => (jogador === c.you ? 1 : 0) },
        text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.',
      }),
    ],
  }],
  rulings: { 1: 'teste: com duas Exploration, você joga três terrenos no turno' },
});
