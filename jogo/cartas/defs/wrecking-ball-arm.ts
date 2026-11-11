// Wrecking Ball Arm
// Equipped creature has base power and toughness 7/7 and can't be blocked by creatures with power 2 or less.
// Equip legendary creature {3}
// Equip {7}
import { and, defineCard, equip, is, power, staticAbility, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Wrecking Ball Arm',
  faces: [{
    abilities: [
      staticAbility({
        // camada 7b (CR 613.4b): define a força e a resistência base
        affects: (c, o) => c.g.state.objects[c.source]?.attachedTo === o.id,
        mods: () => [{ k: 'setPT', p: 7, t: 7 }],
        // restrição de bloqueio (CR 509.1b): só vale ao declarar os bloqueadores
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => c.g.state.objects[c.source]?.attachedTo !== atacante || power(c.g, bloqueador) > 2 },
        text: 'A criatura equipada tem força e resistência base 7/7 e não pode ser bloqueada por criaturas com força 2 ou menos.',
      }),
      // CR 702.6c: equipar com restrição
      { ...equip('{3}'), targets: [t.creature(and(is.yours, is.legendary), 'criatura lendária alvo que você controla')], text: 'Equipar criatura lendária {3}' },
      equip('{7}'),
    ],
  }],
  rulings: {
    1: 'teste: CR 509.1b: depois de bloqueada, baixar a força do bloqueador não a desbloqueia',
    2: 'teste: CR 613.4c: marcadores e modificações de força continuam valendo sobre a base 7/7',
    3: 'teste: CR 613.7: a base 7/7 vence efeitos de base anteriores e perde para os posteriores',
  },
});
