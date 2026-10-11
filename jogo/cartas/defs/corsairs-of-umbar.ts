// Corsairs of Umbar
// {2}{U}: Target Goblin, Orc, or Pirate can't be blocked this turn.
// Whenever this creature deals combat damage to a player, amass Orcs 3. (Put three +1/+1 counters on an Army you control.
// It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)
import { activated, amass, defineCard, is, on, or, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { REUNIR } from '../mordor.ts';

export default defineCard({
  name: 'Corsairs of Umbar',
  faces: [{
    abilities: [
      // ruling 1: ativada depois do bloqueio, não desfaz o bloqueio
      activated('{2}{U}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.permanent(or(is.subtype('Goblin'), is.subtype('Orc'), is.subtype('Pirate')), 'Goblin, Orc ou Pirate alvo')], text: '{2}{U}: O Goblin, Orc ou Pirate alvo não pode ser bloqueado neste turno.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) { yield* amass(c.g, c.you, 'Orc', 3); }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, reúna Orcs 3.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1 — a restrição vale só ao declarar bloqueadores; depois do bloqueio, a criatura continua bloqueada (motor/combat.ts)',
    2: REUNIR.escrita,
    3: REUNIR.como,
    4: REUNIR.zumbis,
    5: REUNIR.varios,
    6: REUNIR.entra00,
    7: REUNIR.alvos,
    8: REUNIR.reunido,
  },
});
