// Necron Deathmark
// Flash
// Synaptic Disintegrator — When this creature enters, destroy up to one target creature and target player mills three
// cards.
import { defineCard, destroy, etb, keyword, mill, t, tgtPlayer, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Necron Deathmark',
  faces: [{
    abilities: [
      keyword('flash'),
      etb(function* (c) {
        const r = c.targets[0]?.[0];
        if (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield') yield* destroy(c.g, [r.id]);
        const p = tgtPlayer(c, 1);
        if (p !== null) yield* mill(c.g, p, 3);
      }, { targets: [upTo(1, t.creature()), t.player()], text: 'Synaptic Disintegrator — Quando esta criatura entra, destrua até uma criatura alvo e o jogador alvo tritura três cartas.' }),
    ],
  }],
  rulings: {},
});