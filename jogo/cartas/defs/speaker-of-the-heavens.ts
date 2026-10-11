// Speaker of the Heavens
// Vigilance, lifelink (Attacking doesn't cause this creature to tap. Damage dealt by this creature also causes you to
// gain that much life.)
// {T}: Create a 4/4 white Angel creature token with flying. Activate only if you have at least 7 life more than your
// starting life total and only as a sorcery.
import { activated, createTokens, defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Speaker of the Heavens',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'lifelink'),
      activated('{T}', function* (c) { yield* createTokens(c.g, c.you, 'Angel', 1); }, {
        timing: 'sorcery',
        condition: (c) => c.g.state.players[c.you].life >= c.g.state.config.startingLife + 7,
        text: '{T}: Crie uma ficha de criatura Angel 4/4 branca com voar. Ative somente se você tiver pelo menos 7 de vida a mais que o seu total de vida inicial e somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: Gigante de Duas Cabeças não existe no jogo',
  },
});