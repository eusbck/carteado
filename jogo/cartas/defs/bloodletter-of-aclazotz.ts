// Bloodletter of Aclazotz
// Flying
// If an opponent would lose life during your turn, they lose twice that much life instead. (Damage causes loss of life.)
import { defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Bloodletter of Aclazotz',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: dobra a perda de vida, não o dano (o vínculo com a vida ganha só o dano causado)
      staticAbility({
        rules: { lifeLossDouble: (c, jogador) => c.g.state.turn.active === c.you && c.g.isOpponent(c.you, jogador) },
        text: 'Se um oponente fosse perder pontos de vida durante o seu turno, em vez disso ele perde o dobro.',
      }),
    ],
  }],
  rulings: { 1: 'teste: no seu turno, o oponente perde o dobro da vida; o dano causado e a vida que você ganha não dobram' },
});