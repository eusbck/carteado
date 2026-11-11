// Twinflame Tyrant
// Flying
// If a source you control would deal damage to an opponent or a permanent an opponent controls, it deals double that
// damage instead.
import { controllerOf, defineCard, keyword, lkiChars, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Twinflame Tyrant',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 614.1a, 701.10g; ruling 3: o dano já dividido ou atribuído é que dobra; ruling 1: quem causa é a mesma fonte
      staticAbility({
        rules: {
          damageDouble: (c, fonte, alvo) => {
            const dono = c.g.state.objects[fonte] ? controllerOf(c.g, fonte) : lkiChars(c.g, fonte)?.controller;
            if (dono !== c.you) return false;
            if (alvo.kind === 'player') return c.g.isOpponent(c.you, alvo.id);
            return !!c.g.state.objects[alvo.id] && c.g.isOpponent(c.you, controllerOf(c.g, alvo.id));
          },
        },
        text: 'Se uma fonte que você controla fosse causar dano a um oponente ou a um permanente que um oponente controla, em vez disso ela causa o dobro desse dano.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o dano dobrado é causado pela fonte original',
    2: 'regra geral: CR 616.1 — quem recebe o dano escolhe a ordem das substituições e prevenções (motor/actions.ts dealDamage)',
    3: 'teste: em combate, dobra o dano atribuído a cada um',
  },
});
