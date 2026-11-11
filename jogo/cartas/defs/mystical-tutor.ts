// Mystical Tutor
// Search your library for an instant or sorcery card, reveal it, then shuffle and put that card on top.
import { chars, defineCard, moveObjects, nameOf, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Mystical Tutor',
  faces: [{
    spell: {
      *effect(c) {
        const achadas = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => chars(c.g, id).types.some((x) => x === 'Instant' || x === 'Sorcery'), prompt: 'Procure uma carta de instantânea ou de feitiço' });
        if (achadas.length) c.g.log(`${c.g.state.players[c.you].name} revela ${nameOf(c.g, achadas[0])}.`, { rule: '701.20' });
        // ruling 1: embaralhar e pôr a carta no topo é uma ação só
        shuffleLibrary(c.g, c.you);
        if (achadas.length && c.g.state.objects[achadas[0]]?.zone === 'library') yield* moveObjects(c.g, [{ id: achadas[0], to: 'library', position: 'top' }], 'effect');
      },
    },
  }],
  rulings: { 1: 'teste: busca uma instantânea ou feitiço, embaralha e põe a carta no topo do grimório' },
});
