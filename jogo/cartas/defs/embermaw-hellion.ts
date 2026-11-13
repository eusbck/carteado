// Embermaw Hellion
// Trample
// If another red source you control would deal damage to a permanent or player, it deals that much damage plus 1 to that
// permanent or player instead.
import { controllerOf, defineCard, keyword, lkiChars, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Embermaw Hellion',
  faces: [{
    abilities: [
      keyword('trample'),
      // CR 614.1a: substituição do dano; quem causa o dano continua sendo a fonte original (ruling 1)
      staticAbility({
        rules: {
          damageBonus: (c, fonte) => {
            if (fonte === c.source) return 0;
            const o = c.g.state.objects[fonte] ?? c.g.state.lki[fonte]?.obj;
            const dono = c.g.state.objects[fonte] ? controllerOf(c.g, fonte) : o?.controller;
            if (!o || dono !== c.you) return 0;
            return lkiChars(c.g, fonte)?.colors.includes('R') ? 1 : 0;
          },
        },
        text: 'Se outra fonte vermelha que você controla fosse causar dano a uma permanente ou a um jogador, em vez disso ela causa esse dano mais 1 a essa permanente ou a esse jogador.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a fonte vermelha causa o dano mais 1; a Hellion não causa dano',
    2: 'regra geral: CR 616.1 — a prevenção e o "mais 1" se aplicam na ordem do afetado; prevenido todo, não há o que somar (motor/actions.ts dealDamage)',
    3: 'teste: duas Hellions somam 2 às outras fontes e 1 uma à outra',
  },
});
