// Planet Killer
// Flying, indestructible
// This creature attacks each combat if able.
// Whenever this creature deals combat damage to a player, put a +1/+1 counter on it for each land that player controls.
import { addCounters, controlledBy, defineCard, isLand, keywords, on, staticAbility, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Planet Killer',
  faces: [{
    abilities: [
      ...keywords('flying', 'indestructible'),
      staticAbility({ rules: { attacksIfAble: (c, id) => id === c.source }, text: 'Esta criatura ataca a cada combate se puder.' }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        // a contagem é feita na resolução
        const n = controlledBy(c.g, p, (id) => isLand(c.g, id)).length;
        if (n > 0 && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, coloque nela um marcador +1/+1 para cada terreno que esse jogador controla.' }),
    ],
  }],
  rulings: {},
});
