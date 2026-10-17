// Silent-Blade Oni
// Ninjutsu {4}{U}{B} ({4}{U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield
// from your hand tapped and attacking.)
// Whenever this creature deals combat damage to a player, look at that player's hand. You may cast a spell from among
// those cards without paying its mana cost.
import { defineCard, ninjutsu, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { conjuraDentreGratis, ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Silent-Blade Oni',
  faces: [{
    abilities: [
      ninjutsu('{4}{U}{B}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const p = c.event.player as PlayerId;
        const mao = [...c.g.state.zones.hand[p]];
        c.g.log(`${c.g.state.players[c.you].name} olha a mão de ${c.g.state.players[p].name}.`);
        // a escolha mostra ao controlador a mão inteira; os terrenos aparecem, indisponíveis
        yield* conjuraDentreGratis(c, mao, { rotulo: `Silent-Blade Oni (mão de ${c.g.state.players[p].name})`, varias: false, olhar: true });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, olhe a mão desse jogador. Você pode conjurar uma mágica dentre essas cartas sem pagar o custo de mana dela.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mágica de permanente entra sob o seu controle; a instantânea vai para o cemitério do dono',
    2: ROUBO.durante,
    3: ROUBO.gratisAlternativo,
  },
});
