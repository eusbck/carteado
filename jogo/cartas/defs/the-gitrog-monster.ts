// The Gitrog Monster
// Deathtouch
// At the beginning of your upkeep, sacrifice The Gitrog Monster unless you sacrifice a land.
// You may play an additional land on each of your turns.
// Whenever one or more land cards are put into your graveyard from anywhere, draw a card.
import { chooseItems, defineCard, draw, keyword, nameOf, objItem, on, sacrifice, staticAbility, triggered } from '../../motor/api.ts';
import { terrenosDe, terrenosVaoParaSeuCemiterio } from '../terras.ts';

export default defineCard({
  name: 'The Gitrog Monster',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.upkeep('you'), function* (c) {
        const terras = terrenosDe(c.g, c.you);
        const ops = [...terras.map((x) => objItem(c.g, x, `Sacrificar ${nameOf(c.g, x)}`)), { id: 'gitrog', label: 'Sacrificar The Gitrog Monster' }];
        const [esc] = yield* chooseItems(c.g, c.you, 'The Gitrog Monster: sacrifique um terreno ou ele', ops, 1, 1);
        yield* sacrifice(c.g, [esc === 'gitrog' ? c.source : Number(esc)]);
      }, { text: 'No início da sua manutenção, sacrifique The Gitrog Monster, a menos que você sacrifique um terreno.' }),
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      triggered(terrenosVaoParaSeuCemiterio(), function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Sempre que uma ou mais cartas de terreno são colocadas no seu cemitério vindas de qualquer lugar, compre uma carta.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 603.2 — várias cartas de terreno ao mesmo tempo disparam uma vez' },
});
