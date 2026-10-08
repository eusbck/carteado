// Raffine's Guidance
// Enchant creature
// Enchanted creature gets +1/+1.
// You may cast this card from your graveyard by paying {2}{W} rather than paying its mana cost.
import { attachedGets, defineCard, t } from '../../motor/api.ts';

export default defineCard({
  name: "Raffine's Guidance",
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    // custo alternativo para conjurar do cemitério (CR 118.9); volta ao cemitério normalmente depois
    altCosts: [{ key: 'cemiterio', label: 'conjurar do cemitério por {2}{W}', zone: 'graveyard', mana: '{2}{W}' }],
    abilities: [attachedGets(() => [{ k: 'pt', p: 1, t: 1 }], 'A criatura encantada recebe +1/+1.')],
  }],
  rulings: {
  },
});
