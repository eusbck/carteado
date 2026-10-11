// Idol of Oblivion
// {T}: Draw a card. Activate only if you created a token this turn.
// {8}, {T}, Sacrifice this artifact: Create a 10/10 colorless Eldrazi creature token.
import { activated, createTokens, defineCard, draw } from '../../motor/api.ts';

export default defineCard({
  name: 'Idol of Oblivion',
  faces: [{
    abilities: [
      // ruling 1: vale a ficha criada antes de o Idol entrar, e mesmo que ela já tenha saído do campo
      activated('{T}', function* (c) { yield* draw(c.g, c.you, 1); }, {
        condition: (c) => (c.g.state.turnStats[c.you].tokensCreated ?? 0) > 0,
        text: '{T}: Compre uma carta. Ative somente se você criou uma ficha neste turno.',
      }),
      activated('{8}, {T}, Sacrifice this artifact', function* (c) { yield* createTokens(c.g, c.you, 'Eldrazi 10/10', 1); }, { text: '{8}, {T}, Sacrifique este artefato: Crie uma ficha de criatura Eldrazi 10/10 incolor.' }),
    ],
  }],
  rulings: {
    1: 'teste: {T}: compra uma carta, só se você criou uma ficha neste turno',
  },
});