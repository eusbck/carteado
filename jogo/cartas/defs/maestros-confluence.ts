// Maestros Confluence
// Choose three. You may choose the same mode more than once.
// • Return target monocolored instant or sorcery card from your graveyard to your hand.
// • Target creature gets -3/-3 until end of turn.
// • Goad each creature target player controls. (Until your next turn, those creatures attack each combat if able and
//   attack a player other than you if able.)
import { and, creaturesOf, defineCard, goad, is, modal, returnToHand, t, tgt, tgtPlayer, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Maestros Confluence',
  faces: [{
    spell: {
      // CR 700.2d: três modos, podendo repetir; resolvem na ordem em que estão escritos
      modes: modal(3, 3, [
        {
          text: 'Devolva a carta de instantânea ou feitiço monocolorida alvo do seu cemitério para a sua mão',
          targets: [t.card('graveyard', and(is.instantOrSorcery, is.monocolored), 'carta de instantânea ou feitiço monocolorida alvo no seu cemitério', 'you')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* returnToHand(c.g, [id]); },
        },
        {
          text: 'A criatura alvo recebe -3/-3 até o fim do turno',
          targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: -3, t: -3 }]); },
        },
        {
          text: 'Incite cada criatura que o jogador alvo controla',
          targets: [t.player()],
          *effect(c) {
            const p = tgtPlayer(c, 0);
            // CR 701.15: até o seu próximo turno, atacam a cada combate e atacam outro jogador que não você, se puderem
            if (p !== null) for (const id of creaturesOf(c.g, p)) goad(c.g, id, c.you);
          },
        },
      ], { repeat: true }),
    },
  }],
  rulings: {},
});
