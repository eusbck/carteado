// Surgehacker Mech
// Menace
// When this Vehicle enters, it deals damage equal to twice the number of Vehicles you control to target creature or
// planeswalker an opponent controls.
// Crew 4
import { and, crew, dealDamage, defineCard, etb, is, isCreature, isType, keyword, t, tgt } from '../../motor/api.ts';
import { veiculosDe } from '../veiculos.ts';

export default defineCard({
  name: 'Surgehacker Mech',
  faces: [{
    abilities: [
      keyword('menace'),
      // a contagem é feita na resolução e inclui o próprio Mech
      etb(function* (c) {
        const id = tgt(c);
        const n = 2 * veiculosDe(c.g, c.you).length;
        if (id !== null && n > 0) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: n, combat: false }]);
      }, {
        targets: [t.permanent(and(is.opponents, (c, id) => isCreature(c.g, id) || isType(c.g, id, 'Planeswalker')), 'criatura ou planeswalker alvo que um oponente controla')],
        text: 'Quando este Veículo entra, ele causa dano igual ao dobro do número de Veículos que você controla à criatura ou planeswalker alvo que um oponente controla.',
      }),
      crew(4),
    ],
  }],
  rulings: {},
});
