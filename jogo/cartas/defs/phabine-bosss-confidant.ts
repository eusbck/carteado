// Phabine, Boss's Confidant
// Creature tokens you control have haste.
// Parley — At the beginning of combat on your turn, each player reveals the top card of their library. For each land card
// revealed this way, you create a 1/1 green and white Citizen creature token. Then creatures you control get +1/+1 until
// end of turn for each nonland card revealed this way. Then each player draws a card.
import { and, anthem, createTokens, creaturesOf, defineCard, draw, is, isLand, nameOf, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: "Phabine, Boss's Confidant",
  faces: [{
    abilities: [
      anthem(and(is.creature, is.token, is.yours), () => [{ k: 'addKeyword', kw: 'haste' }], 'As fichas de criatura que você controla têm ímpeto.'),
      // Parlamentar (palavra de habilidade, CR 207.2c)
      triggered(on.beginCombat('you'), function* (c) {
        const s = c.g.state;
        let terrenos = 0;
        let outras = 0;
        for (const p of c.g.apnap()) {
          const topo = s.zones.library[p][0];
          if (topo === undefined) continue;
          c.g.log(`${s.players[p].name} revela ${nameOf(c.g, topo)} (parlamentar).`, { rule: '701.20a' });
          if (isLand(c.g, topo)) terrenos++; else outras++;
        }
        if (terrenos > 0) yield* createTokens(c.g, c.you, 'Citizen', terrenos);
        // as fichas recém-criadas também recebem o bônus (CR 611.2c: as criaturas que você controla nesse momento)
        const ids = creaturesOf(c.g, c.you);
        if (outras > 0 && ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: outras, t: outras }]);
        for (const p of c.g.apnap()) yield* draw(c.g, p, 1);
      }, { text: 'Parlamentar — No início do combate no seu turno, cada jogador revela a carta do topo do grimório dele. Para cada carta de terreno revelada assim, você cria uma ficha de criatura Citizen 1/1 verde e branca. Depois, as criaturas que você controla recebem +1/+1 até o fim do turno para cada carta que não é terreno revelada assim. Depois, cada jogador compra uma carta.' }),
    ],
  }],
  rulings: {},
});
