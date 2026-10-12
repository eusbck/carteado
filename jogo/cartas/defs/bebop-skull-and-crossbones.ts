// Bebop, Skull & Crossbones
// Partner with Rocksteady, Mutant Marauder (When this creature enters, target player may put Rocksteady into their hand
// from their library, then shuffle.)
// Deathtouch
// Whenever Bebop deals combat damage to a player, you may draw X cards, where X is the number of counters on Bebop. If
// you do, you lose X life.
import { defineCard, draw, keyword, loseLife, on, triggered, yesNo } from '../../motor/api.ts';
import { PARCEIRO_COM, SELECAO } from '../tartarugas.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Bebop, Skull & Crossbones',
  faces: [{
    abilities: [
      parceiroCom('Rocksteady, Mutant Marauder'),
      keyword('deathtouch'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const o = c.g.state.objects[c.source];
        if (!o || o.zone !== 'battlefield') return;
        // ruling 2: X é contado uma vez só, ao resolver
        const x = Object.values(o.counters).reduce((a, n) => a + Math.max(0, n), 0);
        if (x <= 0 || !(yield* yesNo(c.g, c.you, `Bebop: comprar ${x} carta(s) e perder ${x} de vida?`))) return;
        yield* draw(c.g, c.you, x);
        loseLife(c.g, c.you, x, c.source);
      }, { text: 'Sempre que Bebop causa dano de combate a um jogador, você pode comprar X cartas, sendo X o número de marcadores em Bebop. Se fizer isso, você perde X pontos de vida.' }),
    ],
  }],
  rulings: {
    1: PARCEIRO_COM.gatilho,
    2: 'teste: toque mortífero; causando dano de combate a um jogador, você pode comprar X cartas e perder X de vida, X = marcadores nele',
    3: PARCEIRO_COM.deck,
    4: SELECAO.identidade,
    5: SELECAO.comecam,
    6: SELECAO.controla,
    7: SELECAO.separados,
    8: PARCEIRO_COM.gatilho,
    9: PARCEIRO_COM.busca,
    10: PARCEIRO_COM.soEntreSi,
  },
});