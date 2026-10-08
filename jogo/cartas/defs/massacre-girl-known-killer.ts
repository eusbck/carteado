// Massacre Girl, Known Killer
// Menace
// Creatures you control have wither. (They deal damage to creatures in the form of -1/-1 counters.)
// Whenever a creature an opponent controls dies, if its toughness was less than 1, draw a card.
import { defineCard, draw, isCreature, keyword, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Massacre Girl, Known Killer',
  faces: [{
    abilities: [
      keyword('menace'),
      // ruling 2: vale para qualquer dano causado pelas suas criaturas
      staticAbility({
        affects: (c, o) => o.zone === 'battlefield' && o.controller === c.you && isCreature(c.g, o.id),
        mods: () => [{ k: 'addKeyword', kw: 'wither' }],
        text: 'As criaturas que você controla têm murchar.',
      }),
      // ruling 1: resistência da última vez no campo
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller) && (l.toughness ?? 0) < 1), function* (c) {
        yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, se a resistência dela era menor que 1, compre uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: criatura com resistência 0 por marcadores faz comprar',
    2: 'teste: dano de combate das suas criaturas vira marcadores',
  },
});
