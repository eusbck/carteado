// Ninja of the Deep Hours
// Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Whenever this creature deals combat damage to a player, you may draw a card.
import { defineCard, draw, ninjutsu, on, triggered, yesNo } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Ninja of the Deep Hours',
  faces: [{
    abilities: [
      ninjutsu('{1}{U}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        if (yield* yesNo(c.g, c.you, 'Ninja of the Deep Hours: comprar uma carta?')) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: 'teste: entra pelo ninjutsu atacando o mesmo jogador e compra ao causar dano',
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
  },
});
