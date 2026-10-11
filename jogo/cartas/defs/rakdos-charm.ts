// Rakdos Charm
// Choose one —
// • Exile target player's graveyard.
// • Destroy target artifact.
// • Each creature deals 1 damage to its controller.
import { allCreatures, controllerOf, dealDamage, defineCard, destroy, exile, modal, t, tgt, tgtPlayer } from '../../motor/api.ts';

export default defineCard({
  name: 'Rakdos Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Exile o cemitério do jogador alvo', targets: [t.player()],
          *effect(c) { const p = tgtPlayer(c); if (p !== null && c.g.state.zones.graveyard[p].length) yield* exile(c.g, [...c.g.state.zones.graveyard[p]]); },
        },
        { text: 'Destrua o artefato alvo', targets: [t.artifact()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
        {
          text: 'Cada criatura causa 1 de dano ao controlador dela',
          *effect(c) {
            // a fonte de cada dano é a própria criatura
            const ids = allCreatures(c.g);
            if (ids.length) dealDamage(c.g, ids.map((id) => ({ source: id, target: { kind: 'player' as const, id: controllerOf(c.g, id) }, amount: 1, combat: false })));
          },
        },
      ]),
    },
  }],
  rulings: {},
});
