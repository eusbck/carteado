// Grand Coliseum
// This land enters tapped.
// {T}: Add {C}.
// {T}: Add one mana of any color. This land deals 1 damage to you.
import { dealDamage, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Grand Coliseum',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      // CR 605.3b: o dano faz parte da habilidade de mana (não usa a pilha)
      mana('any', {
        text: '{T}: Adicione uma mana de qualquer cor. Este terreno causa 1 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 1, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
