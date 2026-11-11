// Tarnished Citadel
// {T}: Add {C}.
// {T}: Add one mana of any color. This land deals 3 damage to you.
import { dealDamage, defineCard, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Tarnished Citadel',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', {
        text: '{T}: Adicione uma mana de qualquer cor. Este terreno causa 3 de dano a você.',
        *extra(c) { dealDamage(c.g, [{ source: c.source, target: { kind: 'player', id: c.you }, amount: 3, combat: false }]); },
      }),
    ],
  }],
  rulings: {},
});
