// Kazuul, Tyrant of the Cliffs
// Whenever a creature an opponent controls attacks, if you're the defending player, create a 3/3 red Ogre creature
// token unless that creature's controller pays {3}.
import { controllerOf, createTokens, defineCard, mayPay, nameOf, on, parseCost, triggered } from '../../motor/api.ts';
import { canAfford } from '../../motor/costs.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Kazuul, Tyrant of the Cliffs',
  faces: [{
    abilities: [
      // rulings 1, 2 e 6: um disparo por criatura de oponente que ataca você ou um planeswalker seu
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        return e.attackers.flatMap((a) => {
          const def = a.target.kind === 'player' ? a.target.id : c.g.state.objects[a.target.id] ? controllerOf(c.g, a.target.id) : null;
          if (def !== c.you || !c.g.isOpponent(c.you, e.player)) return [];
          return [{ atacante: a.obj, quem: e.player }];
        });
      }), function* (c) {
        const quem = c.event.quem as PlayerId;
        // ruling 3: o pagamento é oferecido a quem controla a criatura atacante (se ele puder pagar)
        const pagou = !c.g.state.players[quem].left && canAfford(c.g, quem, parseCost('{3}'), { purpose: { kind: 'effect' } }) && (yield* mayPay(c, quem, '{3}', `não dar uma ficha Ogre a ${c.g.state.players[c.you].name} (${nameOf(c.g, c.source)})`));
        if (!pagou) yield* createTokens(c.g, c.you, 'Ogre', 1);
      }, { text: 'Sempre que uma criatura que um oponente controla ataca, se você for o jogador defensor, crie uma ficha de criatura Ogre vermelha 3/3, a menos que o controlador dessa criatura pague {3}.' }),
    ],
  }],
  rulings: {
    1: 'teste: atacar um planeswalker seu também conta',
    2: 'teste: Bruno ataca você com duas criaturas: dois disparos; paga {3} por uma e você cria um Ogre pela outra',
    3: 'teste: Bruno ataca você com duas criaturas: dois disparos; paga {3} por uma e você cria um Ogre pela outra',
    4: 'regra geral: CR 508.8 — o gatilho resolve na etapa de declarar atacantes; o Ogre pode bloquear nesse combate',
    5: 'regra geral: CR 603.3b — a ordem dos gatilhos é a do controlador de cada um',
    6: 'teste: criatura que ataca outro jogador não dispara',
  },
});
