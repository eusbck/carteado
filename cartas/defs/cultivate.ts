// Cultivate
// Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the
// other into your hand, then shuffle.
import { chooseItems, defineCard, isBasicLand, moveObjects, nameOf, objItem, putOntoBattlefield, searchLibrary, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Cultivate',
  faces: [{
    spell: {
      *effect(c) {
        const achados = yield* searchLibrary(c.g, c.you, c.you, { max: 2, filter: (id) => isBasicLand(c.g, id), prompt: 'Procure até duas cartas de terreno básico' });
        if (achados.length) {
          c.g.log(`${c.g.state.players[c.you].name} revela ${achados.map((id) => nameOf(c.g, id)).join(', ')}.`, { rule: '701.20' });
          // ruling 1: com uma só, ela vai para o campo
          let campo = achados[0];
          if (achados.length === 2) {
            const [pick] = yield* chooseItems(c.g, c.you, 'Escolha o terreno que vai para o campo virado (o outro vai para a mão)', achados.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
            campo = Number(pick);
          }
          const mao = achados.filter((id) => id !== campo);
          yield* putOntoBattlefield(c.g, [{ id: campo, controller: c.you, tapped: true }], 'search');
          if (mao.length) yield* moveObjects(c.g, mao.map((id) => ({ id, to: 'hand' as const })), 'search');
        }
        shuffleLibrary(c.g, c.you);
      },
    },
  }],
  rulings: { 1: 'teste: com uma só carta encontrada, ela vai para o campo virada' },
});
