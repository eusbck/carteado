// Hatut Zeraze Strike Force
// When you cast this spell, copy it for each time you've cast your commander from the command zone this game.
// When this creature enters, destroy up to one target artifact or enchantment.
import { copySpell, defineCard, destroy, etb, is, onCastThis, or, t, tgt, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Hatut Zeraze Strike Force',
  faces: [{
    abilities: [
      onCastThis(function* (c) {
        // CR 903.8: as vezes em que você conjurou os seus comandantes da zona de comando nesta partida
        const n = Object.values(c.g.state.players[c.you].commanderCasts).reduce((a, b) => a + b, 0);
        // as cópias de mágica de permanente viram fichas ao resolver (CR 608.3f)
        for (let i = 0; i < n; i++) yield* copySpell(c.g, c.source, c.you, { semExtra: i > 0 });
      }, 'Quando você conjura esta mágica, copie-a para cada vez que você conjurou o seu comandante da zona de comando nesta partida.'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [upTo(1, t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo'))], text: 'Quando esta criatura entra, destrua até um artefato ou encantamento alvo.' }),
    ],
  }],
  rulings: {},
});