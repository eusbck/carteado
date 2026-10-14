// Chittering Witch
// When this creature enters, create a number of 1/1 black Rat creature tokens equal to the number of opponents you have.
// {1}{B}, Sacrifice a creature: Target creature gets -2/-2 until end of turn.
import { activated, createTokens, defineCard, etb, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Chittering Witch',
  faces: [{
    abilities: [
      // ruling 2: oponentes que saíram da partida não contam
      etb(function* (c) {
        const n = c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Rat', n);
      }, { text: 'Quando esta criatura entra, crie uma ficha de criatura Rat preta 1/1 para cada oponente que você tem.' }),
      activated('{1}{B}, Sacrifice a creature', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: -2, t: -2 }]);
      }, { targets: [t.creature()], text: '{1}{B}, Sacrifique uma criatura: A criatura alvo recebe -2/-2 até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: pode sacrificar a própria Witch para pagar o custo',
    2: 'teste: cria uma Rat por oponente que ainda está na partida',
  },
});
