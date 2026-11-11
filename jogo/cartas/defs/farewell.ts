// Farewell
// Choose one or more —
// • Exile all artifacts.
// • Exile all creatures.
// • Exile all enchantments.
// • Exile all graveyards.
import { defineCard, exile, isCreature, isType, modal } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';

const doCampo = (g: G, f: (id: ObjId) => boolean) => g.state.zones.battlefield.filter(f);

export default defineCard({
  name: 'Farewell',
  faces: [{
    spell: {
      // ruling 1: os modos escolhidos acontecem na ordem impressa
      modes: modal(1, 4, [
        { text: 'Exile todos os artefatos', *effect(c) { yield* exile(c.g, doCampo(c.g, (id) => isType(c.g, id, 'Artifact'))); } },
        { text: 'Exile todas as criaturas', *effect(c) { yield* exile(c.g, doCampo(c.g, (id) => isCreature(c.g, id))); } },
        { text: 'Exile todos os encantamentos', *effect(c) { yield* exile(c.g, doCampo(c.g, (id) => isType(c.g, id, 'Enchantment'))); } },
        { text: 'Exile todos os cemitérios', *effect(c) { yield* exile(c.g, c.g.state.zones.graveyard.flat()); } },
      ]),
      *effect() { /* os modos fazem tudo */ },
    },
  }],
  rulings: { 1: 'teste: ruling 1: com mais de um modo, cada um acontece na ordem impressa' },
});
