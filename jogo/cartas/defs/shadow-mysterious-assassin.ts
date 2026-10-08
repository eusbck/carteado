// Shadow, Mysterious Assassin
// Deathtouch
// Throw — Whenever Shadow deals combat damage to a player, you may sacrifice another nonland permanent. If you do,
// draw two cards and each opponent loses life equal to the mana value of the sacrificed permanent.
import { chooseItems, controlledBy, defineCard, draw, isLand, keyword, lkiChars, loseLife, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Shadow, Mysterious Assassin',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const opcoes = controlledBy(c.g, c.you, (id) => id !== c.source && !isLand(c.g, id));
        if (opcoes.length === 0) return;
        const pick = yield* chooseItems(c.g, c.you, 'Arremesso: você pode sacrificar outro permanente não terreno', opcoes.map((id) => objItem(c.g, id, nameOf(c.g, id))), 0, 1);
        if (pick.length === 0) return;
        const id = Number(pick[0]);
        const [r] = yield* sacrifice(c.g, [id]);
        if (r === null) return;
        yield* draw(c.g, c.you, 2);
        // rulings 1-2: valor de mana como existia por último no campo (X = 0)
        const vm = lkiChars(c.g, id)?.manaValue ?? 0;
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, vm, c.source);
      }, { text: 'Arremesso — Sempre que Shadow causa dano de combate a um jogador, você pode sacrificar outro permanente não terreno. Se fizer isso, compre duas cartas e cada oponente perde vida igual ao valor de mana do permanente sacrificado.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — X vale 0 no campo',
    2: 'teste: usa o valor de mana do permanente sacrificado',
  },
});
