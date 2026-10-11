// Smuggler's Share
// At the beginning of each end step, draw a card for each opponent who drew two or more cards this turn, then create a
// Treasure token for each opponent who had two or more lands enter the battlefield under their control this turn.
import { createTokens, defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Smuggler's Share",
  faces: [{
    abilities: [
      triggered(on.endStep('each'), function* (c) {
        const s = c.g.state;
        const oponentes = c.g.opponents(c.you);
        const compras = oponentes.filter((p) => s.turnStats[p].cardsDrawn >= 2).length;
        if (compras) yield* draw(c.g, c.you, compras);
        const terrenos = oponentes.filter((p) => (s.turnStats[p].landsEntered ?? 0) >= 2).length;
        if (terrenos) yield* createTokens(c.g, c.you, 'Treasure', terrenos);
      }, { text: 'No início de cada etapa final, compre uma carta para cada oponente que comprou duas ou mais cartas neste turno, depois crie uma ficha de Treasure para cada oponente que teve dois ou mais terrenos entrando no campo sob o controle dele neste turno.' }),
    ],
  }],
  rulings: {},
});
