// Majestic Genesis
// Reveal the top X cards of your library, where X is the greatest mana value of a commander you own on the battlefield
// or in the command zone. You may put any number of permanent cards from among them onto the battlefield. Put the rest
// on the bottom of your library in a random order.
import { chooseItems, defineCard, isPermanentCard, manaValue, moveObjects, nameOf, objItem, putOntoBattlefield, type G } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { PlayerId } from '../../motor/types.ts';
import { jog, objs, reg } from '../../motor/registro.ts';

/** maior valor de mana entre os comandantes de que o jogador é dono no campo ou na zona de comando (ruling 1: mesmo
 *  controlado por outro jogador) */
function maiorComandante(g: G, p: PlayerId): number {
  const s = g.state;
  const ids = [...s.zones.battlefield, ...s.zones.command].filter((id) => {
    const o = s.objects[id];
    return !!o && o.owner === p && o.card !== null && s.players[p].commanders.includes(o.card);
  });
  return ids.reduce((m, id) => Math.max(m, manaValue(g, id)), 0);
}

export default defineCard({
  name: 'Majestic Genesis',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const x = maiorComandante(g, c.you);
        const topo = g.state.zones.library[c.you].slice(0, x);
        if (!topo.length) return;
        reg(g, 'revela')`${jog(c.you)} revela ${objs(topo)} (Majestic Genesis).`;
        const cands = topo.filter((id) => isPermanentCard(g, id));
        const esc = cands.length
          ? (yield* chooseItems(g, c.you, 'Majestic Genesis: escolha as cartas de permanente que vão para o campo', cands.map((id) => objItem(g, id, nameOf(g, id))), 0, cands.length)).map(Number)
          : [];
        if (esc.length) yield* putOntoBattlefield(g, esc.map((id) => ({ id, controller: c.you })), 'effect');
        const resto = shuffle(g.state.rng, topo.filter((id) => !esc.includes(id) && g.state.objects[id]?.zone === 'library'));
        if (resto.length) yield* moveObjects(g, resto.map((id) => ({ id, to: 'library' as const, position: 'bottom' as const })), 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: X é o maior valor de mana entre os seus comandantes no campo ou na zona de comando, mesmo controlado por outro',
  },
});
