// Venerated Stormsinger
// Mobilize 1 (Whenever this creature attacks, create a tapped and attacking 1/1 red Warrior creature token. Sacrifice it
// at the beginning of the next end step.)
// Whenever this creature or another creature you control dies, each opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, mobilize, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Venerated Stormsinger',
  faces: [{
    abilities: [
      // rulings 1-2: cada ficha ataca quem você escolher; não foram declaradas atacantes (motor/criaturas.ts)
      mobilize(1),
      triggered(on.dies((c, lki) => lki.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que esta criatura ou outra criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.181a — cada ficha ataca quem você escolher (motor/criaturas.ts mobilize)',
    2: 'regra geral: CR 508.3a — fichas que entram atacando não foram declaradas atacantes (motor/criaturas.ts)',
  },
});
