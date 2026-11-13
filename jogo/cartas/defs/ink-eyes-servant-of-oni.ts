// Ink-Eyes, Servant of Oni
// Ninjutsu {3}{B}{B} ({3}{B}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield
// from your hand tapped and attacking.)
// Whenever Ink-Eyes deals combat damage to a player, you may put target creature card from that player's graveyard onto
// the battlefield under your control.
// {1}{B}: Regenerate Ink-Eyes.
import { activated, defineCard, is, nameOf, ninjutsu, on, putOntoBattlefield, regenerate, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Ink-Eyes, Servant of Oni',
  faces: [{
    abilities: [
      ninjutsu('{3}{B}{B}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Ink-Eyes: pôr ${nameOf(c.g, id)} no campo sob o seu controle?`)) {
          yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        }
      }, {
        targets: [t.card('graveyard', (c, id) => is.creature(c, id) && c.g.state.objects[id]?.owner === (c.event?.player as PlayerId | undefined), 'carta de criatura alvo do cemitério desse jogador', 'any')],
        text: 'Sempre que Ink-Eyes causa dano de combate a um jogador, você pode colocar a carta de criatura alvo do cemitério desse jogador no campo sob o seu controle.',
      }),
      activated('{1}{B}', function* (c) { regenerate(c, c.source); }, { text: '{1}{B}: Regenere Ink-Eyes.' }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura que morreu no mesmo dano de combate já pode ser o alvo',
  },
});
