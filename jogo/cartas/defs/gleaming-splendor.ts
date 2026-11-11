// Gleaming Splendor
// Whenever an opponent draws their second card each turn, you create a Treasure token.
// {2}{W}: Two target players each draw a card.
import { activated, createTokens, defineCard, draw, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Gleaming Splendor',
  faces: [{
    abilities: [
      // ruling 1: conta as compras do turno inteiro, mesmo antes de Gleaming Splendor entrar; uma vez por oponente por turno
      triggered(on.custom((e, c) => e.type === 'draw' && c.g.isOpponent(c.you, e.player) && e.nth === 2), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que um oponente compra a segunda carta dele em cada turno, você cria uma ficha de Tesouro.' }),
      // ruling 2: dois jogadores diferentes
      activated('{2}{W}', function* (c) {
        for (const i of [0, 1]) {
          const p = tgtPlayer(c, i);
          if (p !== null && !c.g.state.players[p].left) yield* draw(c.g, p, 1);
        }
      }, { targets: [t.player(undefined, 'primeiro jogador alvo'), { ...t.player(undefined, 'segundo jogador alvo'), differentFrom: [0] }], text: '{2}{W}: Cada um de dois jogadores alvo compra uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: o oponente que compra a segunda carta no turno dá um Tesouro, só uma vez por turno',
    2: 'teste: os dois alvos precisam ser jogadores diferentes',
  },
});
