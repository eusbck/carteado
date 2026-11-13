// Higure, the Still Wind
// Ninjutsu {2}{U}{U} ({2}{U}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield
// from your hand tapped and attacking.)
// Whenever Higure deals combat damage to a player, you may search your library for a Ninja card, reveal it, put it into
// your hand, then shuffle.
// {2}: Target Ninja creature can't be blocked this turn.
import { activated, chars, defineCard, is, ninjutsu, on, searchTo, t, tgt, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Higure, the Still Wind',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Higure: procurar uma carta Ninja no seu grimório?'))) return;
        // CR 205.3m: carta Ninja (polimorfo conta)
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Ninja'), 1, 'hand', { reveal: true, prompt: 'Higure: procure uma carta Ninja' });
      }, { text: 'Sempre que Higure causa dano de combate a um jogador, você pode procurar no seu grimório uma carta Ninja, revelá-la e colocá-la na sua mão. Depois embaralhe.' }),
      activated('{2}', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'rule', id: 'rule:cantBeBlocked' }]);
      }, { targets: [t.creature(is.subtype('Ninja'), 'criatura Ninja alvo')], text: '{2}: A criatura Ninja alvo não pode ser bloqueada neste turno.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.49a — o Ninja achado pode usar o ninjutsu até o fim do combate (motor/conjurar-alternativo.ts)',
    2: 'regra geral: CR 510.4 — com primeiro golpe, o gatilho resolve antes do dano normal (motor/combat.ts)',
  },
});
