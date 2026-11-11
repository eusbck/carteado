// Giant Space Amoeba
// Flying
// Whenever this creature attacks, target creature defending player controls gets -3/-0 until end of turn, then create
// a token that's a copy of this creature.
import { controllerOf, copiableValues, createTokens, defineCard, keyword, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { defensorDe } from '../startrek.ts';

export default defineCard({
  name: 'Giant Space Amoeba',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'pt', p: -3, t: 0 }]);
        // CR 707.2: a cópia (pela última informação, se a Amoeba saiu do campo); não entra atacando
        yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, c.source) }, 1);
      }, {
        targets: [t.creature((c, id) => controllerOf(c.g, id) === defensorDe(c.g, c.source), 'criatura alvo que o jogador defensor controla')],
        text: 'Sempre que esta criatura ataca, a criatura alvo que o jogador defensor controla recebe -3/-0 até o fim do turno; depois crie uma ficha que é uma cópia desta criatura.',
      }),
    ],
  }],
  rulings: {},
});
