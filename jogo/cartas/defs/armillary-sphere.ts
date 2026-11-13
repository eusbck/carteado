// Armillary Sphere
// {2}, {T}, Sacrifice this artifact: Search your library for up to two basic land cards, reveal them, put them into your
// hand, then shuffle.
import { activated, defineCard, isBasicLand, moveObjects, searchLibrary, shuffleLibrary } from '../../motor/api.ts';
import { jog, objs, reg } from '../../motor/registro.ts';

export default defineCard({
  name: 'Armillary Sphere',
  faces: [{
    abilities: [
      activated('{2}, {T}, Sacrifice this artifact', function* (c) {
        const achados = yield* searchLibrary(c.g, c.you, c.you, { max: 2, filter: (id) => isBasicLand(c.g, id), prompt: 'Procure até duas cartas de terreno básico' });
        if (achados.length) {
          reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${objs(achados)}.`;
          yield* moveObjects(c.g, achados.map((id) => ({ id, to: 'hand' as const })), 'search');
        }
        shuffleLibrary(c.g, c.you);
      }, { text: '{2}, {T}, Sacrifique este artefato: Procure no seu grimório até duas cartas de terreno básico, revele-as, coloque-as na sua mão e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});