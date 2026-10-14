// Dungrove Elder
// Hexproof (This creature can't be the target of spells or abilities your opponents control.)
// Dungrove Elder's power and toughness are each equal to the number of Forests you control.
import { controlledBy, defineCard, isSubtype, keyword, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Dungrove Elder',
  faces: [{
    abilities: [
      keyword('hexproof'),
      // habilidade que define característica (CR 604.3, 613.4a): vale em todas as zonas; conta o tipo de terreno Forest,
      // não o nome (ruling 1)
      selfGets((c) => { const n = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Forest')).length; return [{ k: 'setPT', p: n, t: n }]; },
        'A força e a resistência de Dungrove Elder são iguais ao número de Florestas que você controla.', { cda: true }),
    ],
  }],
  rulings: {
    1: 'teste: conta os terrenos com o tipo Forest, não só os chamados Forest, e muda com eles',
    2: 'teste: conta os terrenos com o tipo Forest, não só os chamados Forest, e muda com eles',
    3: 'teste: vale também fora do campo',
  },
});
