// Keeper of Fables
// Whenever one or more non-Human creatures you control deal combat damage to a player, draw a card.
import { defineCard, draw, isCreature, isSubtype, triggered } from '../../motor/api.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

export default defineCard({
  name: 'Keeper of Fables',
  faces: [{
    abilities: [
      // ruling 1: um gatilho para cada jogador que tomou dano; ruling 3: iniciativa dá dois lotes de dano no mesmo combate
      triggered(seusCausamDanoDeCombate((c, id) => isCreature(c.g, id) && !isSubtype(c.g, id, 'Human')), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Sempre que uma ou mais criaturas não Humanas que você controla causam dano de combate a um jogador, compre uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: dano de combate a dois jogadores ao mesmo tempo dá uma compra para cada jogador',
    2: 'regra geral: CR 510.2 — o dano de combate é simultâneo; o gatilho dispara mesmo que Keeper of Fables morra nesse dano (motor/triggers.ts)',
    3: 'regra geral: CR 510.4 — com iniciativa há duas etapas de dano de combate, e o gatilho pode disparar em cada uma',
  },
});
