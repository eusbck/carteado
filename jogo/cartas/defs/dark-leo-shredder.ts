// Dark Leo & Shredder
// Sneak {W}{B}
// Attacking Ninjas you control have deathtouch.
// Whenever Dark Leo & Shredder deal combat damage to a player, create a 1/1 black Ninja creature token. Then if you
// control five or more Ninjas, that player loses half their life, rounded up.
import { anthem, controlledBy, createTokens, defineCard, is, isAttacking, isSubtype, loseLife, on, sneak, triggered } from '../../motor/api.ts';

const furtivo = sneak('{W}{B}');

export default defineCard({
  name: 'Dark Leo & Shredder',
  faces: [{
    // CR 702.190: na sua etapa de declarar bloqueadores, conjura devolvendo uma criatura não bloqueada; entra atacando
    altCosts: [furtivo.altCost],
    abilities: [
      furtivo.ability,
      anthem((c, id) => is.yours(c, id) && isSubtype(c.g, id, 'Ninja') && isAttacking(c.g, id), () => [{ k: 'addKeyword', kw: 'deathtouch' }], 'Ninjas atacantes que você controla têm toque mortífero.'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        yield* createTokens(c.g, c.you, 'Ninja', 1);
        const ninjas = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Ninja')).length;
        const quem = c.event.player as number;
        if (ninjas >= 5 && !c.g.state.players[quem].left) {
          const vida = c.g.state.players[quem].life;
          // metade arredondada para cima (de um total positivo)
          if (vida > 0) loseLife(c.g, quem, Math.ceil(vida / 2), c.source);
        }
      }, { text: 'Sempre que Dark Leo & Shredder causam dano de combate a um jogador, crie uma ficha de criatura Ninja preta 1/1. Depois, se você controla cinco ou mais Ninjas, esse jogador perde metade da vida, arredondada para cima.' }),
    ],
  }],
  rulings: {
    1: 'teste: pelo sneak, entra virada e atacando quem a criatura devolvida atacava',
    2: 'teste: não foi declarada atacante: gatilhos de atacar não disparam',
    3: 'teste: só na sua etapa de declarar bloqueadores, depois dos bloqueios',
  },
});
