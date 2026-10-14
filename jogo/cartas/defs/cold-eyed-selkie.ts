// Cold-Eyed Selkie
// Islandwalk (This creature can't be blocked as long as defending player controls an Island.)
// Whenever this creature deals combat damage to a player, you may draw that many cards.
import { chars, controllerOf, defineCard, draw, keyword, on, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Cold-Eyed Selkie',
  faces: [{
    abilities: [
      keyword('islandwalk'),
      // CR 702.14c: travessia de ilha — não pode ser bloqueada enquanto o jogador defensor controla uma Island
      staticAbility({
        rules: {
          canBeBlockedBy: (c, atacante, bloqueador) => {
            if (atacante !== c.source) return true;
            const defensor = controllerOf(c.g, bloqueador);
            return !c.g.state.zones.battlefield.some((id) => !c.g.state.objects[id].phasedOut && controllerOf(c.g, id) === defensor && chars(c.g, id).subtypes.includes('Island'));
          },
        },
        text: 'Travessia de ilha (esta criatura não pode ser bloqueada enquanto o jogador defensor controlar uma Island).',
      }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const n = c.event.amount as number;
        if (n > 0 && (yield* yesNo(c.g, c.you, `Cold-Eyed Selkie: comprar ${n} carta(s)?`))) yield* draw(c.g, c.you, n);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode comprar essa quantidade de cartas.' }),
    ],
  }],
  rulings: {},
});
