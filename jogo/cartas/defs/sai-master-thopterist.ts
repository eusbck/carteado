// Sai, Master Thopterist
// Whenever you cast an artifact spell, create a 1/1 colorless Thopter artifact creature token with flying.
// {1}{U}, Sacrifice two artifacts: Draw a card.
import { activated, createTokens, defineCard, draw, is, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Sai, Master Thopterist",
  faces: [{
    abilities: [
      triggered(on.youCast(is.artifact), function*(c) { yield* createTokens(c.g, c.you, 'Thopter', 1); }, { text: 'Sempre que você conjura uma mágica de artefato, crie um Thopter incolor 1/1 com voar.' }),
      activated('{1}{U}, Sacrifice two artifacts', function*(c) { yield* draw(c.g, c.you, 1); }, { text: '{1}{U}, Sacrifique dois artefatos: compre uma carta.' }),
    ]
  }],
  rulings: {
    "1": "CR 603.3, 117.4: gatilho de conjuração resolve antes do artefato; teste: ficha criada mesmo quando a mágica é anulada."
  },
});
