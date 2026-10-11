// Willie Lumpkin, Postman
// Willie Lumpkin can't be blocked.
// Whenever Willie Lumpkin deals combat damage to an opponent, you draw a card and that player may draw a card. If they
// do, that player can't attack you or permanents you control during their next turn.
import { addEffect, defineCard, draw, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Willie Lumpkin, Postman',
  faces: [{
    abilities: [
      staticAbility({ rules: { canBeBlockedBy: (c, atacante) => atacante !== c.source }, text: 'Willie Lumpkin não pode ser bloqueado.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        if (!c.g.isOpponent(c.you, p)) return;
        yield* draw(c.g, c.you, 1);
        if (c.g.state.players[p].left) return;
        if (!(yield* yesNo(c.g, p, 'Willie Lumpkin: comprar uma carta? (você não poderá atacar esse jogador nem os permanentes dele no seu próximo turno)'))) return;
        const compradas = yield* draw(c.g, p, 1);
        if (!compradas.length) return;
        // vale só no próximo turno desse jogador: não no turno atual, se o dano foi causado no turno dele
        const agora = c.g.state.turn.number;
        addEffect(c.g, {
          source: c.source, sourceDef: '', controller: c.you, affected: null,
          duration: { kind: 'endOfYourNextTurn', player: p, afterTurn: agora },
          mods: [{ k: 'rule', id: 'rule:cantAttackPlayer', params: { atacante: p, protegido: c.you, depois: agora } }],
        });
      }, { text: 'Sempre que Willie Lumpkin causa dano de combate a um oponente, você compra uma carta e esse jogador pode comprar uma carta. Se comprar, ele não pode atacar você nem permanentes que você controla no próximo turno dele.' }),
    ],
  }],
  rulings: {},
});
