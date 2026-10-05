// War Room
// {T}: Add {C}.
// {3}, {T}, Pay life equal to the number of colors in your commanders' color identity: Draw a card.
import { activated, commanderIdentity, cost, defineCard, draw, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'War Room',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      // rulings 1, 3: identidade de cor fixada antes da partida; incolor, não paga vida
      activated([...cost('{3}, {T}'), { k: 'life', n: (c) => commanderIdentity(c.g, c.you).length }], function* (c) {
        yield* draw(c.g, c.you, 1);
      }, {
        // ruling 2: sem comandante, não pode ativar
        condition: (c) => c.g.state.players[c.you].commanders.length > 0,
        text: '{3}, {T}, Pague vida igual ao número de cores da identidade de cor dos seus comandantes: Compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 903.4 — comandante incolor, nenhuma vida',
    2: 'teste: sem comandante, não pode ativar',
    3: 'teste: paga pela identidade de cor do comandante',
  },
});
