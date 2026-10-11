// Dragon Man, Reformed Robot
// Flying
// Dragon Man's power is equal to the greatest mana value among noncreature permanents you control and noncreature cards
// in your graveyard.
// You may cast this card from your graveyard by discarding a card in addition to paying its other costs.
import { controllerOf, defineCard, isCreature, keyword, manaValue, selfGets } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { PlayerId } from '../../motor/types.ts';

function maiorValor(g: G, p: PlayerId): number {
  const s = g.state;
  const ids = [
    ...s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && controllerOf(g, id) === p && !isCreature(g, id)),
    ...s.zones.graveyard[p].filter((id) => !isCreature(g, id)),
  ];
  return ids.reduce((n, id) => Math.max(n, manaValue(g, id)), 0);
}

export default defineCard({
  name: 'Dragon Man, Reformed Robot',
  faces: [{
    // conjurar do cemitério pagando o custo normal e descartando uma carta
    altCosts: [{
      key: 'graveyard', label: 'Conjurar do cemitério (descartando uma carta)', zone: 'graveyard', mana: null, useManaCost: true,
      parts: [{ k: 'discard', n: 1, label: 'uma carta' }],
    }],
    abilities: [
      keyword('flying'),
      // habilidade que define característica (CR 604.3): vale em todas as zonas; a resistência impressa é 5
      selfGets((c, o) => [{ k: 'setPT', p: maiorValor(c.g, o.controller), t: 5 }], 'A força de Dragon Man é igual ao maior valor de mana entre as permanentes que não são criaturas que você controla e as cartas que não são de criatura no seu cemitério.', { cda: true }),
    ],
  }],
  rulings: {},
});
