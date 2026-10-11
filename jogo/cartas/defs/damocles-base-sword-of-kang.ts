// Damocles Base, Sword of Kang
// Flying, deathtouch
// Whenever Damocles Base deals combat damage to a player, that player faces a villainous choice — They sacrifice a
// nontoken creature of their choice, or they lose 2 life and you draw two cards.
// Crew 3
import { chooseItems, controlledBy, crew, defineCard, draw, isCreature, keywords, loseLife, nameOf, objItem, on, sacrifice, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Damocles Base, Sword of Kang',
  faces: [{
    abilities: [
      ...keywords('flying', 'deathtouch'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        if (c.g.state.players[p].left) return;
        // CR 701.55a-b: o jogador escolhe uma das opções, mesmo que ela seja impossível, e faz o que der
        const [esc] = yield* chooseItems(c.g, p, 'Damocles Base: escolha vilanesca', [
          { id: 'sacrificar', label: 'Sacrificar uma criatura que não é ficha, à sua escolha' },
          { id: 'vida', label: `Perder 2 de vida e ${c.g.state.players[c.you].name} compra duas cartas` },
        ], 1, 1);
        if (esc === 'sacrificar') {
          const minhas = controlledBy(c.g, p, (id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken);
          if (!minhas.length) return;
          const [qual] = minhas.length === 1 ? [String(minhas[0])] : yield* chooseItems(c.g, p, 'Sacrifique uma criatura que não é ficha', minhas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          yield* sacrifice(c.g, [Number(qual)]);
          return;
        }
        loseLife(c.g, p, 2, c.source);
        yield* draw(c.g, c.you, 2);
      }, { text: 'Sempre que Damocles Base causa dano de combate a um jogador, esse jogador enfrenta uma escolha vilanesca — ele sacrifica uma criatura que não é ficha à escolha dele, ou ele perde 2 de vida e você compra duas cartas.' }),
      // CR 702.122a
      crew(3),
    ],
  }],
  rulings: {},
});
