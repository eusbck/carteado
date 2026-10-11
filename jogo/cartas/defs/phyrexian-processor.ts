// Phyrexian Processor
// As this artifact enters, pay any amount of life.
// {4}, {T}: Create an X/X black Phyrexian Minion creature token, where X is the life paid as this artifact entered.
import { activated, asEnters, chooseNumber, createTokens, defineCard, loseLife } from '../../motor/api.ts';

export default defineCard({
  name: 'Phyrexian Processor',
  faces: [{
    abilities: [
      // ruling 1: pode pagar 0; no máximo o seu total de vida (CR 119.4)
      asEnters(function* (c, ev) {
        const vida = Math.max(0, c.g.state.players[ev.controller].life);
        const n = vida > 0 ? yield* chooseNumber(c.g, ev.controller, 'Phyrexian Processor: quanta vida você paga? (as fichas serão X/X)', 0, vida) : 0;
        if (n > 0) loseLife(c.g, ev.controller, n, ev.obj);
        ev.choices.vidaPaga = n;
      }, 'Ao entrar, pague qualquer quantidade de vida.'),
      activated('{4}, {T}', function* (c) {
        const x = Number((c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.choices.vidaPaga ?? 0);
        yield* createTokens(c.g, c.you, { copyOf: { def: 'Minion X/X', face: 0, except: { power: x, toughness: x } } }, 1);
      }, { text: '{4}, {T}: Crie uma ficha de criatura Phyrexian Minion X/X preta, onde X é a vida paga quando este artefato entrou.' }),
    ],
  }],
  rulings: {
    1: 'teste: pagando 0 de vida, as fichas são 0/0 e morrem',
  },
});