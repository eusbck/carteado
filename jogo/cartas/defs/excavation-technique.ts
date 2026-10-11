// Excavation Technique
// Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may
// choose new targets for their copies.)
// Destroy target nonland permanent. Its controller creates two Treasure tokens.
import { controllerOf, createTokens, defineCard, demonstrate, destroy, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Excavation Technique',
  faces: [{
    abilities: [demonstrate()],
    spell: {
      targets: [t.nonlandPermanent()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const controlador = controllerOf(c.g, id);
        yield* destroy(c.g, [id]);
        yield* createTokens(c.g, controlador, 'Treasure', 2);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.144a — você decide copiar quando o gatilho de demonstrar resolve, antes da mágica original (motor/mecanicas.ts demonstrate)',
    2: 'regra geral: CR 702.144a — copiando, você escolhe um oponente, que também copia (motor/mecanicas.ts demonstrate)',
    3: 'regra geral: CR 707.10c — cada um pode escolher novos alvos para a própria cópia (motor/stack.ts copySpell)',
    4: 'teste: demonstrando, a cópia do oponente resolve primeiro, depois a sua, depois a original',
    5: 'teste: sem demonstrar, só a original resolve',
  },
});