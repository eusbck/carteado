// Beacon of Unrest
// Put target artifact or creature card from a graveyard onto the battlefield under your control. Shuffle Beacon of
// Unrest into its owner's library.
import { chars, defineCard, moveObjects, putOntoBattlefield, shuffleLibrary, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Beacon of Unrest',
  faces: [{
    spell: {
      targets: [t.card('graveyard', (c, id) => chars(c.g, id).types.some((x) => x === 'Artifact' || x === 'Creature'), 'carta de artefato ou de criatura alvo num cemitério', 'any')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        // ruling 1: com o alvo ilegal a mágica nem resolve e não é embaralhada
        const dono = c.g.state.objects[c.source]?.owner;
        if (dono === undefined) return;
        yield* moveObjects(c.g, [{ id: c.source, to: 'library' }], 'shuffle');
        shuffleLibrary(c.g, dono);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o alvo ilegal a mágica não resolve e vai para o cemitério, sem ser embaralhada (motor/stack.ts)',
    2: 'regra geral: CR 800.4a — quando um jogador sai da partida, o que ele controla por efeito de controle é exilado (motor/game-context.ts)',
  },
});