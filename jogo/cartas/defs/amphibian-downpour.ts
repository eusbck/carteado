// Amphibian Downpour
// Flash
// Storm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the
// copies. Copies become tokens.)
// Enchant creature
// Enchanted creature loses all abilities and is a blue Frog creature with base power and toughness 1/1.
import { attachedGets, defineCard, keyword, t } from '../../motor/api.ts';
import { storm } from '../esquilos.ts';

export default defineCard({
  name: 'Amphibian Downpour',
  faces: [{
    enchant: t.creature(),
    abilities: [
      keyword('flash'),
      // CR 702.40a (cartas/esquilos.ts); a cópia de mágica de permanente vira ficha ao resolver (CR 608.3f, 707.10f)
      storm(),
      // camadas 4, 5, 6 e 7b: ruling 7, os supertipos ficam e os outros tipos de carta saem; ruling 8, os subtipos que não
      // são de criatura também; ruling 9, a força e a resistência base 1/1 têm o registro desta Aura
      attachedGets(() => [
        { k: 'setTypes', types: ['Creature'], subtypes: ['Frog'], keepSupertypes: true },
        { k: 'setColors', colors: ['U'] },
        { k: 'loseAllAbilities' },
        { k: 'setPT', p: 1, t: 1 },
      ], 'A criatura encantada perde todas as habilidades e é uma criatura Frog azul com força e resistência base 1/1.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.40a — as cópias não são conjuradas e não contam (cartas/esquilos.ts)',
    2: 'teste: conta as mágicas conjuradas antes no turno; as cópias viram fichas presas a outras criaturas',
    3: 'regra geral: CR 707.10 — cada cópia é anulada separadamente (motor/stack.ts)',
    4: 'regra geral: CR 702.40a — a tempestade é um gatilho; anulado, não há cópias (cartas/esquilos.ts)',
    5: 'teste: conta as mágicas conjuradas antes no turno; as cópias viram fichas presas a outras criaturas',
    6: 'regra geral: CR 613.7 — habilidade ganha depois tem registro mais novo e continua (motor/chars.ts)',
    7: 'teste: uma criatura artefato lendária vira Frog azul 1/1, continua lendária e deixa de ser artefato',
    8: 'teste: uma criatura artefato lendária vira Frog azul 1/1, continua lendária e deixa de ser artefato',
    9: 'regra geral: CR 613.4b — efeitos de definir força e resistência base seguem o registro de data e hora (motor/chars.ts)',
    10: 'teste: marcadores +1/+1 continuam somando à base 1/1',
    11: 'regra geral: CR 613.1d — o efeito desta Aura não depende de outro efeito que fazia dele criatura (motor/chars.ts)',
    12: 'regra geral: CR 704.5g — o dano marcado continua e pode ficar letal (motor/sba.ts)',
  },
});
