// Neriv, Heart of the Storm
// Flying
// If a creature you control that entered this turn would deal damage, it deals twice that much damage instead.
import { controllerOf, defineCard, isCreature, keyword, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Neriv, Heart of the Storm',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 614.1a, 701.10g; ruling 1: o dano dobrado é da mesma fonte; ruling 3: o dano já atribuído é que dobra
      staticAbility({
        rules: {
          damageDouble: (c, fonte) => {
            const s = c.g.state;
            if (!s.objects[fonte] || s.objects[fonte].zone !== 'battlefield') return false;
            const entrou = s.enteredThisTurn?.turn === s.turn.number && s.enteredThisTurn.objs.includes(fonte);
            return entrou && isCreature(c.g, fonte) && controllerOf(c.g, fonte) === c.you;
          },
        },
        text: 'Se uma criatura que você controla que entrou neste turno fosse causar dano, em vez disso ela causa o dobro desse dano.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura que entrou neste turno causa o dobro do dano; as outras não',
    2: 'regra geral: CR 616.1 — quem recebe o dano escolhe a ordem das substituições e prevenções (motor/actions.ts dealDamage)',
    3: 'regra geral: CR 510.1 — o dano de combate é atribuído antes de dobrar (motor/combat.ts)',
  },
});
