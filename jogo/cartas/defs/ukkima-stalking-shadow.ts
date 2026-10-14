// Ukkima, Stalking Shadow
// Partner with Cazur, Ruthless Stalker (When this creature enters, target player may put Cazur into their hand from
// their library, then shuffle.)
// Ukkima can't be blocked.
// When Ukkima leaves the battlefield, it deals X damage to target player and you gain X life, where X is its power.
import { dealDamage, defineCard, gainLife, keyword, lkiChars, on, t, tgtPlayer, triggered } from '../../motor/api.ts';
import { parceiroCom } from '../vampiros.ts';

export default defineCard({
  name: 'Ukkima, Stalking Shadow',
  faces: [{
    abilities: [
      parceiroCom('Cazur, Ruthless Stalker'),
      { ...keyword('unblockable'), text: 'Ukkima não pode ser bloqueada.' },
      triggered(on.selfLeaves(), function* (c) {
        const p = tgtPlayer(c);
        if (p === null) return;
        // ruling 1: a força como existia por último no campo; negativa vale 0
        const x = Math.max(0, lkiChars(c.g, c.source)?.power ?? 0);
        if (x <= 0) return;
        dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: p }, amount: x, combat: false }]);
        gainLife(c.g, c.you, x, c.source);
      }, { targets: [t.player()], text: 'Quando Ukkima sai do campo, ela causa X de dano ao jogador alvo e você ganha X de vida, sendo X a força dela.' }),
    ],
  }],
  rulings: {
    1: 'teste: usa a força como existia por último no campo',
    2: 'regra geral: CR 608.2b — com o jogador alvo ilegal, a habilidade não resolve e você não ganha vida',
    3: 'regra geral: CR 704.3 — com 0 de vida você perde nas ações de estado, antes de o gatilho ir para a pilha (motor/sba.ts)',
  },
});
