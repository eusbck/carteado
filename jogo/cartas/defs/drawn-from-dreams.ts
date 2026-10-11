// Drawn from Dreams
// Look at the top seven cards of your library. Put two of them into your hand and the rest on the bottom of your library
// in a random order.
import { chooseItems, defineCard, moveObjects, nameOf, objItem } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';

export default defineCard({
  name: 'Drawn from Dreams',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 7);
        if (!topo.length) return;
        // "duas delas": obrigatório, até onde houver cartas; não são reveladas
        const n = Math.min(2, topo.length);
        const esc = topo.length <= n ? topo.map(String) : yield* chooseItems(c.g, c.you, 'Drawn from Dreams: escolha duas cartas para a sua mão (o resto vai para o fundo do grimório em ordem aleatória)', topo.map((id) => ({ ...objItem(c.g, id, nameOf(c.g, id)), card: { def: s.objects[id].def } })), n, n);
        const paraMao = esc.map(Number);
        yield* moveObjects(c.g, paraMao.map((id) => ({ id, to: 'hand' as const })), 'effect');
        const resto = shuffle(s.rng, topo.filter((id) => !paraMao.includes(id) && s.objects[id]?.zone === 'library'));
        s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !resto.includes(id)), ...resto];
        c.g.bump();
      },
    },
  }],
  rulings: {},
});
