// Curiosity Crafter
// Flying
// You have no maximum hand size.
// Whenever a creature token you control deals combat damage to a player, draw a card.
import { defineCard, draw, keyword, lkiChars, lkiObj, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Curiosity Crafter',
  faces: [{
    abilities: [
      keyword('flying'),
      staticAbility({ rules: { noMaxHandSize: (c, p) => p === c.you }, text: 'Você não tem tamanho máximo de mão.' }),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you
        && !!lkiObj(c.g, e.source)?.isToken && !!lkiChars(c.g, e.source)?.types.includes('Creature')), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma ficha de criatura que você controla causa dano de combate a um jogador, compre uma carta.' }),
    ],
  }],
  rulings: {},
});
