// Land Tax
// At the beginning of your upkeep, if an opponent controls more lands than you, you may search your library for up to
// three basic land cards, reveal them, put them into your hand, then shuffle.
import { controlledBy, defineCard, isBasicLand, isLand, on, searchTo, triggered, yesNo, type G } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const terrenos = (g: G, p: PlayerId) => controlledBy(g, p, (id) => isLand(g, id)).length;

export default defineCard({
  name: 'Land Tax',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) {
      if (!(yield* yesNo(c.g, c.you, 'Land Tax: procurar até três cartas de terreno básico?'))) return;
      // ruling 3: embaralha mesmo sem encontrar nada (searchTo embaralha sempre)
      yield* searchTo(c, c.you, (id) => isBasicLand(c.g, id), 3, 'hand', { reveal: true, prompt: 'Procure até três cartas de terreno básico' });
    }, {
      // CR 603.4: "se" interveniente, conferido ao disparar e ao resolver (ruling 2)
      condition: (c) => c.g.opponents(c.you).some((p) => terrenos(c.g, p) > terrenos(c.g, c.you)),
      text: 'No início da sua manutenção, se um oponente controla mais terrenos que você, você pode procurar até três cartas de terreno básico, revelá-las e colocá-las na sua mão.',
    })],
  }],
  rulings: {
    1: 'regra geral: isBasicLand olha o supertipo básico (inclui os Snow-Covered)',
    2: 'teste: CR 603.4: não dispara se nenhum oponente tem mais terrenos',
    3: 'teste: embaralha mesmo sem pegar nada',
  },
});
