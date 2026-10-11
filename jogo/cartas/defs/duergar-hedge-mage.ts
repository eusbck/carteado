// Duergar Hedge-Mage
// When this creature enters, if you control two or more Mountains, you may destroy target artifact.
// When this creature enters, if you control two or more Plains, you may destroy target enchantment.
import { controlledBy, defineCard, destroy, etb, isSubtype, t, tgt, yesNo } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';

// ruling 3: cada terreno conta pelos tipos que tem
const temDois = (tipo: string) => (c: SCtx) => controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, tipo)).length >= 2;

export default defineCard({
  name: 'Duergar Hedge-Mage',
  faces: [{
    abilities: [
      // rulings 1 e 4 (CR 603.4): cláusula "se" interveniente; o alvo é escolhido ao pôr na pilha e a decisão é na resolução
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, 'Duergar Hedge-Mage: destruir o artefato alvo?'))) yield* destroy(c.g, [id]);
      }, { condition: temDois('Mountain'), targets: [t.artifact()], text: 'Quando esta criatura entra, se você controla duas ou mais Mountains, você pode destruir o artefato alvo.' }),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, 'Duergar Hedge-Mage: destruir o encantamento alvo?'))) yield* destroy(c.g, [id]);
      }, { condition: temDois('Plains'), targets: [t.enchantment()], text: 'Quando esta criatura entra, se você controla duas ou mais Plains, você pode destruir o encantamento alvo.' }),
    ],
  }],
  rulings: {
    1: 'teste: sem dois terrenos do tipo, a habilidade não dispara',
    2: 'regra geral: CR 603.3b — os dois gatilhos disparam juntos e você escolhe a ordem (motor/stack.ts putTriggersOnStack)',
    3: 'regra geral: CR 205.3i — cada terreno conta pelos tipos de terreno que tem (cartas/defs/duergar-hedge-mage.ts)',
    4: 'teste: com duas Mountains e duas Plains, pode destruir um artefato e um encantamento',
  },
});