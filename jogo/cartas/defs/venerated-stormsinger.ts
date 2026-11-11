// Venerated Stormsinger
// Mobilize 1
// Whenever this creature or another creature you control dies, each opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, mobilize, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Venerated Stormsinger',
  faces: [{
    abilities: [
      mobilize(1),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        let perdida = 0;
        for (const p of c.g.opponents(c.you)) perdida += loseLife(c.g, p, 1, c.source);
        void perdida;
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que esta criatura ou outra criatura que você controla morre, cada oponente perde 1 de vida e você ganha 1 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.10a — dispara quando ela mesma morre',
    2: 'regra geral: CR 111.1 — as fichas de Guerreiro sacrificadas também disparam',
  },
});
