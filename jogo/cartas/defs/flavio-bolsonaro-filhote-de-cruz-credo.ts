// Flávio Bolsonaro, Filhote de Cruz Credo (carta própria da mesa)
// As long as you don't control your commander, Flávio Bolsonaro gets +2/+2 and has menace.
// Rachadinha — Sacrifice another creature: Create a Treasure token. Activate only once each turn.
import { activated, and, createTokens, defineCard, is, selfGets } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Flávio Bolsonaro, Filhote de Cruz Credo',
  faces: [{
    abilities: [
      selfGets((c) => (controlaComandante(c.g, c.you) ? [] : [{ k: 'pt', p: 2, t: 2 }, { k: 'addKeyword', kw: 'menace' }]),
        'Enquanto você não controlar o seu comandante, Flávio Bolsonaro recebe +2/+2 e tem ameaçar.'),
      activated([{ k: 'sacrifice', n: 1, filter: and(is.creature, is.other), label: 'outra criatura' }], function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { oncePerTurn: true, text: 'Rachadinha — Sacrifique outra criatura: Crie uma ficha de Tesouro. Ative somente uma vez por turno.' }),
    ],
  }],
  rulings: {},
});
