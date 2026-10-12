// Thor, Asgard's Avenger
// Flying
// If another source you control would deal damage to an opponent or a permanent an opponent controls, it deals that much
// damage plus 1 instead.
import { controllerOf, defineCard, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Thor, Asgard's Avenger",
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 614.1a: substituição do dano; a fonte continua a mesma
      staticAbility({
        rules: {
          damageBonus: (c, fonte, alvo) => {
            if (fonte === c.source) return 0;
            const o = c.g.state.objects[fonte] ?? c.g.state.lki[fonte]?.obj;
            const dono = c.g.state.objects[fonte] ? controllerOf(c.g, fonte) : o?.controller;
            if (!o || dono !== c.you) return 0;
            const sofre = alvo.kind === 'player' ? alvo.id : c.g.state.objects[alvo.id] ? controllerOf(c.g, alvo.id) : c.you;
            return c.g.isOpponent(c.you, sofre) ? 1 : 0;
          },
        },
        text: 'Se outra fonte que você controla fosse causar dano a um oponente ou a uma permanente que um oponente controla, em vez disso ela causa esse dano mais 1.',
      }),
    ],
  }],
  rulings: {},
});