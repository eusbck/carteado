// Archetype of Imagination
// Creatures you control have flying.
// Creatures your opponents control lose flying and can't have or gain flying.
import { anthem, controllerOf, defineCard, isCreature, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Archetype of Imagination',
  faces: [{
    abilities: [
      anthem((c, id) => isCreature(c.g, id) && controllerOf(c.g, id) === c.you, () => [{ k: 'addKeyword', kw: 'flying' }], 'As criaturas que você controla têm voar.'),
      // "não pode ter nem ganhar" vence quem dá voar (CR 101.2): aplicado depois dos outros efeitos da camada 6
      staticAbility({
        cantHave: true,
        affects: (c, o) => isCreature(c.g, o.id) && c.g.isOpponent(c.you, controllerOf(c.g, o.id)),
        mods: () => [{ k: 'loseKeyword', kw: 'flying' }],
        text: 'As criaturas que seus oponentes controlam perdem voar e não podem ter nem ganhar voar.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: as criaturas dos oponentes perdem voar, inclusive as que entram depois',
    2: 'teste: um efeito posterior que daria voar à criatura do oponente não dá (simplificação: o efeito é criado, mas não vale enquanto o Archetype estiver no campo)',
    3: 'regra geral: CR 611.3a — a estática que dá voar volta a valer quando o Archetype sai (motor/chars.ts)',
    4: 'teste: com um Archetype de cada lado, nenhuma criatura tem voar',
  },
});
