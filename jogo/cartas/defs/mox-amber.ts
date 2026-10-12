// Mox Amber
// {T}: Add one mana of any color among legendary creatures and planeswalkers you control.
import { chars, controllerOf, defineCard, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Mox Amber',
  faces: [{
    abilities: [
      // rulings 1-3: uma mana de uma das cores; sem lendárias coloridas, não gera nada
      mana((c) => {
        const cores = new Set<ManaType>();
        for (const id of c.g.state.zones.battlefield) {
          if (controllerOf(c.g, id) !== c.you) continue;
          const ch = chars(c.g, id);
          if (ch.supertypes.includes('Legendary') && (ch.types.includes('Creature') || ch.types.includes('Planeswalker'))) for (const cor of ch.colors) cores.add(cor as ManaType);
        }
        return [...cores].map((cor) => [cor]);
      }, { text: '{T}: Adicione uma mana de qualquer cor entre as criaturas lendárias e os planeswalkers que você controla.' }),
    ],
  }],
  rulings: {
    1: 'teste: gera uma mana de uma das cores das suas criaturas lendárias; sem lendárias coloridas, nenhuma',
    2: 'regra geral: CR 605.1a — sem criatura lendária nem planeswalker, a habilidade não produz mana (cartas/defs/mox-amber.ts)',
    3: 'regra geral: CR 105.1 — incolor não é cor: lendárias incolores não dão mana (cartas/defs/mox-amber.ts)',
  },
});