// Venerable Warsinger
// Vigilance, trample
// Whenever this creature deals combat damage to a player, you may return target creature card with mana value X or less
// from your graveyard to the battlefield, where X is the amount of damage this creature dealt to that player.
import { and, defineCard, is, keywords, manaValue, nameOf, on, putOntoBattlefield, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Venerable Warsinger',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, `Venerable Warsinger: devolver ${nameOf(c.g, id)} ao campo?`)) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // X = dano causado a esse jogador (o alvo depende do evento do gatilho)
        targets: [t.card('graveyard', and(is.creature, (c, id) => manaValue(c.g, id) <= ((c.event?.amount as number | undefined) ?? 0)), 'carta de criatura alvo com valor de mana até o dano causado')],
        text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode devolver a carta de criatura alvo com valor de mana X ou menos do seu cemitério ao campo, onde X é o dano causado a esse jogador.',
      }),
    ],
  }],
});
