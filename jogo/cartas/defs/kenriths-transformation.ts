// Kenrith's Transformation
// Enchant creature
// When this Aura enters, draw a card.
// Enchanted creature loses all abilities and is a green Elk creature with base power and toughness 3/3. (It loses all
// other card types and creature types.)
import { attachedGets, defineCard, draw, etb, t } from '../../motor/api.ts';

export default defineCard({
  name: "Kenrith's Transformation",
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta Aura entra, compre uma carta.' }),
      // camada 4 (só criatura Elk, mantém os supertipos), 5 (verde), 6 (perde as habilidades), 7b (base 3/3)
      attachedGets(() => [
        { k: 'setTypes', types: ['Creature'], subtypes: ['Elk'], keepSupertypes: true },
        { k: 'setColors', colors: ['G'] },
        { k: 'loseAllAbilities' },
        { k: 'setPT', p: 3, t: 3 },
      ], 'A criatura encantada perde todas as habilidades e é uma criatura Elk verde com força e resistência base 3/3 (perde os outros tipos de carta e de criatura).'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.3b — a mágica de Aura com o alvo ilegal não resolve, não entra e não dispara (motor/stack.ts)',
    2: 'teste: a habilidade ganha depois continua valendo',
    3: 'regra geral: CR 613.4b, 613.7 — os efeitos de base de força e resistência valem por ordem de registro (motor/chars.ts)',
    4: 'teste: os marcadores continuam valendo',
    5: 'teste: vira uma criatura Elk verde 3/3 sem habilidades, ainda lendária, e você compra uma carta',
    6: 'teste: num Veículo tripulado, continua criatura Elk depois do fim do turno',
    7: 'regra geral: CR 704.5g — o dano marcado continua e é conferido nas ações de estado com a nova resistência (motor/sba.ts)',
  },
});
