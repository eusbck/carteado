// Austere Command
// Choose two —
// • Destroy all artifacts.
// • Destroy all enchantments.
// • Destroy all creatures with mana value 3 or less.
// • Destroy all creatures with mana value 4 or greater.
import { allCreatures, defineCard, destroy, isType, manaValue, modal } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';

function* destroiOnde(g: G, filtro: (id: number) => boolean) {
  const ids = g.state.zones.battlefield.filter(filtro);
  if (ids.length) yield* destroy(g, ids);
}

export default defineCard({
  name: 'Austere Command',
  faces: [{
    spell: {
      // ruling 2: os modos acontecem em sequência, na ordem impressa (CR 608.2c)
      modes: modal(2, 2, [
        { text: 'Destrua todos os artefatos', *effect(c) { yield* destroiOnde(c.g, (id) => isType(c.g, id, 'Artifact')); } },
        { text: 'Destrua todos os encantamentos', *effect(c) { yield* destroiOnde(c.g, (id) => isType(c.g, id, 'Enchantment')); } },
        { text: 'Destrua todas as criaturas com valor de mana 3 ou menos', *effect(c) { const ids = allCreatures(c.g).filter((id) => manaValue(c.g, id) <= 3); if (ids.length) yield* destroy(c.g, ids); } },
        { text: 'Destrua todas as criaturas com valor de mana 4 ou mais', *effect(c) { const ids = allCreatures(c.g).filter((id) => manaValue(c.g, id) >= 4); if (ids.length) yield* destroy(c.g, ids); } },
      ]),
    },
  }],
  rulings: {
    1: 'regra geral: CR 610.3 — a carta exilada "até" outra sair volta na hora e pode ser destruída por um modo seguinte (motor/efeitos.ts)',
    2: 'teste: dois modos em sequência: artefatos e criaturas de valor de mana 4 ou mais',
    3: 'regra geral: CR 701.19 — cada destruição gasta um escudo de regeneração; coberta por dois modos, a criatura precisa de dois (motor/actions.ts destroy)',
  },
});