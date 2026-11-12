// Bilbo, Birthday Celebrant
// If you would gain life, you gain that much life plus 1 instead.
// {2}{W}{B}{G}, {T}, Exile Bilbo: Search your library for any number of creature cards, put them onto the battlefield,
// then shuffle. Activate only if you have 111 or more life.
import { activated, defineCard, isCreature, searchTo, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Bilbo, Birthday Celebrant',
  faces: [{
    abilities: [
      // CR 614.1a, 119.10: "ganha essa quantidade mais 1", uma vez por evento de ganho de vida (rulings 1-3)
      staticAbility({
        rules: { lifeGainBonus: (c, jogador) => (jogador === c.you ? 1 : 0) },
        text: 'Se você fosse ganhar vida, em vez disso ganha essa quantidade mais 1.',
      }),
      activated([{ k: 'mana', cost: '{2}{W}{B}{G}' }, { k: 'tap' }, { k: 'exileSelf' }], function* (c) {
        const lib = c.g.state.zones.library[c.you];
        yield* searchTo(c, c.you, (id) => isCreature(c.g, id), lib.length, 'battlefield', { prompt: 'Procure quantas cartas de criatura quiser' });
      }, {
        condition: (c) => c.g.state.players[c.you].life >= 111,
        text: '{2}{W}{B}{G}, {T}, Exile Bilbo: Procure no seu grimório quantas cartas de criatura quiser, coloque-as no campo de batalha e depois embaralhe. Ative apenas se você tiver 111 ou mais pontos de vida.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: cada Bilbo é uma substituição própria e soma mais 1 (motor/actions.ts gainLife, lifeGainBonus)',
    2: 'teste: ganhar vida uma vez dá 1 a mais, qualquer que seja a quantidade',
    3: 'regra geral: CR 702.15b — cada fonte com vínculo com a vida gera um ganho de vida próprio (motor/actions.ts dealDamage)',
    4: 'não se aplica: não há Dois Gigantes de Cabeça neste jogo',
  },
});
