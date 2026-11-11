// Jolt
// You may tap or untap target artifact, creature, or land.
// Draw a card at the beginning of the next turn's upkeep.
import { defineCard, delayed, tgt } from '../../motor/api.ts';
import { alvoArtefatoCriaturaOuTerreno, compraNaProximaManutencao, viraOuDesvira } from '../twitch.ts';

// CR 603.7: gatilho atrasado criado na resolução
const COMPRA = compraNaProximaManutencao('Jolt');

export default defineCard({
  name: 'Jolt',
  faces: [{
    spell: {
      targets: [alvoArtefatoCriaturaOuTerreno()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* viraOuDesvira(c, id, 'Jolt');
        delayed(c, COMPRA.id!);
      },
    },
  }],
  rulings: {},
});
