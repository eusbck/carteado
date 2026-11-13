// The Gitrog Monster
// Deathtouch
// At the beginning of your upkeep, sacrifice The Gitrog Monster unless you sacrifice a land.
// You may play an additional land on each of your turns.
// Whenever one or more land cards are put into your graveyard from anywhere, draw a card.
import { chooseItems, defineCard, draw, keyword, nameOf, objItem, on, sacrifice, staticAbility, triggered } from '../../motor/api.ts';
import { terrenosAoCemiterio, terrenosDe } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'The Gitrog Monster',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.upkeep('you'), function* (c) {
        const terrenos = terrenosDe(c.g, c.you);
        const [esc] = terrenos.length
          ? yield* chooseItems(c.g, c.you, 'The Gitrog Monster: sacrifique um terreno (ou nenhum, e sacrifique The Gitrog Monster)', terrenos.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1)
          : [];
        if (esc !== undefined) yield* sacrifice(c.g, [Number(esc)]);
        else if (c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
      }, { text: 'No início da sua manutenção, sacrifique The Gitrog Monster a menos que você sacrifique um terreno.' }),
      // CR 305.2
      staticAbility({
        rules: { extraLandPlays: (c, jogador) => (jogador === c.you ? 1 : 0) },
        text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.',
      }),
      // ruling 1: várias cartas de terreno de uma vez disparam uma vez só
      triggered(on.batch((evs, c) => terrenosAoCemiterio(c.g, evs, c.you).length > 0), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ou mais cartas de terreno são colocadas no seu cemitério vindas de qualquer lugar, compre uma carta.' }),
    ],
  }],
  rulings: { 1: 'teste: moer vários terrenos de uma vez compra uma carta só' },
});
