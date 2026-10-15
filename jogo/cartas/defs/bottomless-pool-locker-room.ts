// Bottomless Pool // Locker Room (Sala: carta dividida com linha de tipo compartilhada, CR 709.5)
// Bottomless Pool {U} — Enchantment — Room
// When you unlock this door, return up to one target creature to its owner's hand.
// Locker Room {4}{U} — Enchantment — Room
// Whenever one or more creatures you control deal combat damage to a player, draw a card.
// (You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked
// door to unlock it.)
import { defineCard, draw, returnToHand, t, tgt, triggered, upTo } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';
import { aoDestrancar } from '../milagres.ts';

export default defineCard({
  name: 'Bottomless Pool // Locker Room',
  faces: [
    {
      abilities: [
        triggered(aoDestrancar(0), function* (c) {
          const id = tgt(c);
          if (id !== null) yield* returnToHand(c.g, [id]);
        }, { targets: [upTo(1, t.creature())], text: 'Quando você destrancar esta porta, devolva até uma criatura alvo para a mão do dono.' }),
      ],
    },
    {
      abilities: [
        // ruling 1: um gatilho por jogador que tomou dano de combate
        triggered(seusCausamDanoDeCombate(() => true), function* (c) {
          yield* draw(c.g, c.you, 1);
        }, { text: 'Sempre que uma ou mais criaturas que você controla causam dano de combate a um jogador, compre uma carta.' }),
      ],
    },
  ],
  rulings: {
    1: 'teste: Locker Room: com dano de combate a dois jogadores, compra duas cartas',
  },
});
