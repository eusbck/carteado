// Farewell
// Choose one or more —
// • Exile all artifacts.
// • Exile all creatures.
// • Exile all enchantments.
// • Exile all graveyards.
import { defineCard, exile, isType, modal, permanentsMatching } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

/** exila todas as permanentes do tipo, olhando o campo na hora em que o modo é feito */
function* exilaTodas(c: Ctx, tipo: string) {
  const ids = permanentsMatching(c.g, (id) => isType(c.g, id, tipo));
  if (ids.length) yield* exile(c.g, ids);
}

export default defineCard({
  name: 'Farewell',
  faces: [{
    spell: {
      // ruling 1: os modos escolhidos são feitos na ordem impressa (CR 700.2a; o motor resolve em ordem crescente)
      modes: modal(1, 4, [
        { text: 'Exile todos os artefatos', *effect(c) { yield* exilaTodas(c, 'Artifact'); } },
        { text: 'Exile todas as criaturas', *effect(c) { yield* exilaTodas(c, 'Creature'); } },
        { text: 'Exile todos os encantamentos', *effect(c) { yield* exilaTodas(c, 'Enchantment'); } },
        {
          text: 'Exile todos os cemitérios',
          *effect(c) {
            const ids = c.g.state.zones.graveyard.flat();
            if (ids.length) yield* exile(c.g, ids);
          },
        },
      ]),
      *effect() { /* os modos fazem tudo */ },
    },
  }],
  rulings: {
    1: 'teste: escolhendo todos os modos, faz cada um na ordem impressa e exila também os cemitérios de todos',
  },
});
