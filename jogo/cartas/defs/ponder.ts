// Ponder
// Look at the top three cards of your library, then put them back in any order. You may shuffle.
// Draw a card.
import { chooseItems, defineCard, draw, nameOf, shuffleLibrary, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Ponder',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const topo = s.zones.library[c.you].slice(0, 3);
        if (topo.length > 1) {
          // CR 401.4: o dono escolhe a ordem; a primeira escolhida fica no topo
          const ordem = (yield* chooseItems(c.g, c.you, 'Ponder: ponha as cartas de volta no topo na ordem que quiser (a primeira escolhida fica no topo)',
            topo.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def } })), topo.length, topo.length, true)).map(Number);
          const lib = c.g.state.zones.library[c.you];
          c.g.state.zones.library[c.you] = [...ordem, ...lib.filter((id) => !ordem.includes(id))];
          c.g.bump();
        }
        // ruling 1: embaralhar inclui as três cartas que você acabou de pôr de volta
        if (yield* yesNo(c.g, c.you, 'Ponder: embaralhar o seu grimório?', 'Embaralhar', 'Não embaralhar')) shuffleLibrary(c.g, c.you);
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {
    1: 'teste: embaralhar inclui as três cartas olhadas',
  },
});
