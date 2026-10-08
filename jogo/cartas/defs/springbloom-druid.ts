// Springbloom Druid
// When this creature enters, you may sacrifice a land. If you do, search your library for up to two basic land cards,
// put them onto the battlefield tapped, then shuffle.
import { controlledBy, defineCard, etb, fetchBasicToBattlefield, isLand, sacrificeYours, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Springbloom Druid',
  faces: [{
    abilities: [etb(function* (c) {
      if (controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length === 0) return;
      if (!(yield* yesNo(c.g, c.you, 'Springbloom Druid: sacrificar um terreno para buscar até dois terrenos básicos?'))) return;
      // ruling 1: um terreno só
      const sac = yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 1, 'um terreno');
      if (sac.length === 0) return;
      yield* fetchBasicToBattlefield(c, 2, { tapped: true, prompt: 'Procure até duas cartas de terreno básico' });
    }, { text: 'Quando esta criatura entra, você pode sacrificar um terreno. Se fizer isso, procure até duas cartas de terreno básico, coloque-as no campo viradas e embaralhe.' })],
  }],
  rulings: { 1: 'teste: sacrifica um terreno só e busca até dois' },
});
