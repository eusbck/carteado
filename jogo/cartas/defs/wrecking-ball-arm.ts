// Wrecking Ball Arm
// Equipped creature has base power and toughness 7/7 and can't be blocked by creatures with power 2 or less.
// Equip legendary creature {3}
// Equip {7}
import { and, attachedGets, defineCard, equip, is, power, staticAbility, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Wrecking Ball Arm',
  faces: [{
    abilities: [
      // CR 613.4b: define força e resistência base (camada 7b)
      attachedGets(() => [{ k: 'setPT', p: 7, t: 7 }], 'A criatura equipada tem força e resistência base 7/7 e não pode ser bloqueada por criaturas com força 2 ou menos.'),
      staticAbility({
        rules: { canBeBlockedBy: (c, atacante, bloqueador) => c.g.state.objects[c.source]?.attachedTo !== atacante || power(c.g, bloqueador) > 2 },
      }),
      // CR 702.6c: equipar com restrição
      { ...equip('{3}'), targets: [t.creature(and(is.yours, is.legendary), 'criatura lendária alvo que você controla')], text: 'Equipar criatura lendária {3}' },
      equip('{7}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 509.1h — depois de bloqueada, mudar a força do bloqueador não desfaz o bloqueio (motor/combat.ts)',
    2: 'teste: ruling 2: +1/+1 e marcadores valem por cima do 7/7',
    3: 'regra geral: CR 613.7 — efeitos de definir base posteriores sobrepõem o do Arm (ordem de carimbo, motor/layers)',
  },
});
