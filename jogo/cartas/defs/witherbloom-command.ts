// Witherbloom Command
// Choose two —
// • Target player mills three cards, then you return a land card from your graveyard to your hand.
// • Destroy target noncreature, nonland permanent with mana value 2 or less.
// • Target creature gets -3/-1 until end of turn.
// • Target opponent loses 2 life and you gain 2 life.
import {
  and, chooseItems, defineCard, destroy, gainLife, is, isLand, loseLife, mill, modal, moveObjects, nameOf, not, objItem, t, tgt, tgtPlayer, untilEndOfTurn,
} from '../../motor/api.ts';

export default defineCard({
  name: 'Witherbloom Command',
  faces: [{
    spell: {
      // rulings 1-2: faz o que puder com os alvos legais (CR 608.2b)
      modes: modal(2, 2, [
        {
          text: 'O jogador alvo moi três cartas e depois você devolve uma carta de terreno do seu cemitério para a mão', targets: [t.player(undefined, 'jogador alvo que moi')],
          *effect(c) {
            const p = tgtPlayer(c);
            if (p === null) return;
            yield* mill(c.g, p, 3);
            // ruling 3: qualquer terreno do seu cemitério, inclusive um que acabou de ser moído
            const terrenos = c.g.state.zones.graveyard[c.you].filter((id) => isLand(c.g, id));
            if (terrenos.length === 0) return;
            const [pick] = yield* chooseItems(c.g, c.you, 'Witherbloom Command: devolva uma carta de terreno do seu cemitério para a mão', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            yield* moveObjects(c.g, [{ id: Number(pick), to: 'hand' }], 'effect');
          },
        },
        {
          text: 'Destrua o permanente não criatura e não terreno alvo com valor de mana 2 ou menos',
          targets: [t.permanent(and(not(is.creature), is.nonland, is.mvAtMost(2)), 'permanente não criatura e não terreno alvo com valor de mana 2 ou menos')],
          *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
        },
        {
          text: 'A criatura alvo recebe -3/-1 até o fim do turno', targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: -3, t: -1 }]); },
        },
        {
          text: 'O oponente alvo perde 2 de vida e você ganha 2 de vida', targets: [t.opponent()],
          *effect(c) { const p = tgtPlayer(c); if (p === null) return; loseLife(c.g, p, 2, c.source); gainLife(c.g, c.you, 2, c.source); },
        },
      ]),
    },
  }],
  rulings: {
    1: 'teste: com um alvo ilegal, os outros modos ainda acontecem',
    2: 'regra geral: CR 608.2b — com todos os alvos ilegais, nada acontece',
    3: 'teste: mirando você mesmo, pode devolver um terreno que acabou de moer',
  },
});
