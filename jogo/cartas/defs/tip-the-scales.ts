// Tip the Scales
// Sacrifice a creature. When you do, all creatures get -X/-X until end of turn, where X is the sacrificed creature's toughness.
import { allCreatures, defineAbility, defineCard, lkiChars, reflexive, sacrificeYours, isCreature, untilEndOfTurn, type TriggeredDef } from '../../motor/api.ts';

// CR 603.12: gatilho reflexivo — os jogadores podem responder sabendo o valor de X (ruling 1)
const reflexo = defineAbility<TriggeredDef>('Tip the Scales:reflexo', {
  kind: 'triggered', on: { kind: 'batch', match: () => false },
  text: 'Todas as criaturas recebem -X/-X até o fim do turno, onde X é a resistência da criatura sacrificada.',
  *effect(c) {
    const x = c.data.x as number;
    untilEndOfTurn(c, allCreatures(c.g), [{ k: 'pt', p: -x, t: -x }]);
  },
});

export default defineCard({
  name: 'Tip the Scales',
  faces: [{
    spell: {
      *effect(c) {
        const [sac] = yield* sacrificeYours(c, c.you, (id) => isCreature(c.g, id));
        if (sac === undefined) return;
        // ruling 2: usa a resistência da última informação conhecida
        const x = Math.max(0, lkiChars(c.g, sac)?.toughness ?? 0);
        reflexive(c, reflexo.id!, { x });
      },
    },
  }],
  rulings: {
    1: 'teste: o -X/-X vem de um gatilho reflexivo que vai para a pilha depois',
    2: 'teste: X é a resistência da criatura sacrificada como estava no campo',
  },
});
