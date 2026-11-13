// Blackblade Reforged
// Equipped creature gets +1/+1 for each land you control.
// Equip legendary creature {3}
// Equip {7}
import { and, attachedGets, controlledBy, defineCard, equip, is, isLand, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Blackblade Reforged',
  faces: [{
    abilities: [
      attachedGets((c) => { const n = controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length; return [{ k: 'pt', p: n, t: n }]; },
        'A criatura equipada recebe +1/+1 para cada terreno que você controla.'),
      // CR 702.6c (ruling 1); ruling 2: a lendária é checada ao ativar e ao resolver (alvo, CR 608.2b)
      { ...equip('{3}'), targets: [t.creature(and(is.yours, is.legendary), 'criatura lendária alvo que você controla')], text: 'Equipar criatura lendária {3}' },
      equip('{7}'),
    ],
  }],
  rulings: {
    1: 'teste: CR 702.6c — equipar criatura lendária {3} só mira criatura lendária; equipar {7} mira qualquer uma sua',
    2: 'regra geral: CR 608.2b — a criatura lendária é alvo: checada ao ativar e ao resolver; depois, o Equipamento fica onde está (motor/stack.ts)',
  },
});
