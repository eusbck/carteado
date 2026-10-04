// Smothering Abomination
// Devoid (This card has no color.)
// Flying
// At the beginning of your upkeep, sacrifice a creature.
// Whenever you sacrifice a creature, draw a card.
import { defineCard, draw, isCreature, keywords, lkiChars, on, sacrificeYours, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Smothering Abomination',
  faces: [{
    abilities: [
      // devoid: a cor vem dos dados (CR 702.114a, motor/oracle.ts)
      ...keywords('devoid', 'flying'),
      // ruling 2 e 6: escolhe na resolução; se for a única, sacrifica a si mesma
      triggered(on.upkeep('you'), function* (c) { yield* sacrificeYours(c, c.you, (id) => isCreature(c.g, id), 1, 'uma criatura'); }, { text: 'No início da sua manutenção, sacrifique uma criatura.' }),
      triggered(on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && !!lkiChars(c.g, e.old)?.types.includes('Creature')), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que você sacrifica uma criatura, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: sacrificar a própria Abomination dispara a compra (CR 603.10a)',
    2: 'teste: sacrificar a própria Abomination dispara a compra (CR 603.10a)',
    3: 'regra geral: CR 702.114a — devoid é definida nos dados como incolor',
    4: 'teste: é incolor',
    5: 'não se aplica: moldura da carta',
    6: 'regra geral: CR 608.2 — a escolha é feita na resolução (sacrificeYours)',
    7: 'não se aplica: nenhuma carta dos decks dá cor a outro objeto',
    8: 'teste: é incolor',
  },
});
