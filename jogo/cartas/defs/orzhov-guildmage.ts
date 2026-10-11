// Orzhov Guildmage
// {2}{W}: Target player gains 1 life.
// {2}{B}: Each player loses 1 life.
import { activated, defineCard, gainLife, loseLife, t, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Orzhov Guildmage',
  faces: [{
    abilities: [
      activated('{2}{W}', function* (c) {
        const p = tgtPlayer(c);
        if (p !== null) gainLife(c.g, p, 1, c.source);
      }, { targets: [t.player()], text: '{2}{W}: O jogador alvo ganha 1 de vida.' }),
      activated('{2}{B}', function* (c) {
        for (const p of c.g.apnap()) loseLife(c.g, p, 1, c.source);
      }, { text: '{2}{B}: Cada jogador perde 1 de vida.' }),
    ],
  }],
  rulings: {},
});