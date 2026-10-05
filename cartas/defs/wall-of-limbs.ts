// Wall of Limbs
// Defender (This creature can't attack.)
// Whenever you gain life, put a +1/+1 counter on this creature.
// {5}{B}{B}, Sacrifice this creature: Target player loses X life, where X is this creature's power.
import { activated, addCounters, defineCard, keyword, lkiChars, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Wall of Limbs',
  faces: [{
    abilities: [
      keyword('defender'),
      // rulings 1-2: uma vez por evento de ganho de vida
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 nesta criatura.' }),
      activated('{5}{B}{B}, Sacrifice this creature', function* (c) {
        const p = tgtPlayer(c);
        // ruling 3: força da última vez no campo
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        if (p !== null && x > 0) loseLife(c.g, p, x, c.source);
      }, { targets: [t.player()], text: '{5}{B}{B}, Sacrifique esta criatura: O jogador alvo perde X de vida, onde X é a força desta criatura.' }),
    ],
  }],
  rulings: {
    1: 'teste: um marcador por evento de ganho de vida',
    2: 'regra geral: CR 704.3 — o gatilho dispara mesmo que ela seja destruída antes de resolver',
    3: 'teste: X usa a força com os marcadores',
  },
});
