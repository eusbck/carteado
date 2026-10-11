// Chameleon, Master of Disguise
// You may have Chameleon enter as a copy of a creature you control, except his name is Chameleon, Master of Disguise.
// Mayhem {2}{U} (You may cast this card from your graveyard for {2}{U} if you discarded it this turn. Timing rules still
// apply.)
import { creaturesOf, defineCard, entersAsCopy, mayhem } from '../../motor/api.ts';

const caos = mayhem('{2}{U}');
const NOME = 'Chameleon, Master of Disguise';

export default defineCard({
  name: NOME,
  faces: [{
    // CR 702.187b: do cemitério, pelo custo de mayhem, se foi descartada neste turno
    altCosts: [caos.altCost],
    abilities: [
      // CR 707.5, 707.9b: a exceção do nome faz parte dos valores copiáveis
      entersAsCopy({
        label: NOME, what: 'uma criatura que você controla',
        text: 'Você pode fazer Chameleon entrar como uma cópia de uma criatura que você controla, exceto que o nome dele é Chameleon, Master of Disguise.',
        candidates: (c, ev) => creaturesOf(c.g, ev.controller),
        except: () => ({ name: NOME }),
      }),
      caos.ability,
    ],
  }],
  rulings: {
    1: 'teste: CR 702.187b: descartado neste turno, pode ser conjurado do cemitério por {2}{U}, no tempo de uma criatura',
    2: 'regra geral: CR 702.187b — o mayhem é um custo alternativo; os custos adicionais continuam (motor/stack.ts totalSpellCost)',
  },
});
