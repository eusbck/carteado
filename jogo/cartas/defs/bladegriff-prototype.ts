// Bladegriff Prototype
// Flying
// Whenever this creature deals combat damage to a player, destroy target nonland permanent of that player's choice that
// one of your opponents controls.
import { and, defineCard, destroy, is, keyword, on, t, tgt, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Bladegriff Prototype',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um dos seus oponentes controla')],
        // ruling 1: o jogador atingido escolhe o alvo, mas a habilidade é sua (CR 603.3d). Ruling 2 (simplificação): se
        // ele saiu da partida, escolhe o próximo oponente na ordem de turnos, em vez de você escolher qual oponente
        targetChooser: (c) => {
          const p = c.event.player as PlayerId;
          if (!c.g.state.players[p].left) return p;
          return c.g.apnap().find((x) => c.g.isOpponent(c.you, x) && !c.g.state.players[x].left) ?? c.you;
        },
        text: 'Sempre que esta criatura causa dano de combate a um jogador, destrua o permanente não terreno alvo, à escolha desse jogador, que um dos seus oponentes controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o jogador atingido escolhe o alvo, que pode ser de outro oponente; a habilidade continua sua',
    2: 'teste: se o jogador atingido saiu da partida, outro oponente escolhe',
  },
});
