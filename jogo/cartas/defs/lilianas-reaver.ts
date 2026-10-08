// Liliana's Reaver
// Deathtouch
// Whenever this creature deals combat damage to a player, that player discards a card and you create a tapped 2/2
// black Zombie creature token.
import { createTokens, defineCard, discard, keyword, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Liliana's Reaver",
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        // o jogador que sofreu o dano escolhe o descarte; ruling 1: com a mão vazia, a ficha é criada mesmo assim
        yield* discard(c.g, c.event.player as PlayerId, 1);
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1, { tapped: true });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, esse jogador descarta uma carta e você cria uma ficha de criatura Zombie preta 2/2 virada.' }),
    ],
  }],
  rulings: { 1: 'teste: com a mão do jogador vazia, a ficha é criada mesmo assim' },
});
