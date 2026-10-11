// Fanatic of Rhonas
// {T}: Add {G}.
// Ferocious — {T}: Add {G}{G}{G}{G}. Activate only if you control a creature with power 4 or greater.
// Eternalize {2}{G}{G} ({2}{G}{G}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a
// 4/4 black Zombie Snake Druid with no mana cost. Eternalize only as a sorcery.)
import { creaturesOf, defineCard, eternalize, mana, power } from '../../motor/api.ts';

export default defineCard({
  name: 'Fanatic of Rhonas',
  faces: [{
    abilities: [
      mana('G'),
      mana('GGGG', {
        condition: (c) => creaturesOf(c.g, c.you).some((id) => power(c.g, id) >= 4),
        text: 'Feroz — {T}: Adicione {G}{G}{G}{G}. Ative somente se você controla uma criatura com força 4 ou maior.',
      }),
      // rulings 1-4 (CR 702.129a): a ficha é a carta impressa, só que Zombie 4/4 preta sem custo de mana
      eternalize('{2}{G}{G}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 117.3 — com a carta no cemitério e a prioridade com você na sua fase principal, você pode eternizar antes de alguém exilá-la (motor/priority.ts)',
    2: 'regra geral: CR 602.2 — exilar a carta é custo de eternizar (motor/criaturas.ts eternalize)',
    3: 'regra geral: CR 707.2 — a ficha copia só o que está impresso, com as exceções de eternizar (motor/criaturas.ts eternalize)',
    4: 'teste: eternizar: uma ficha cópia, Zombie 4/4 preta sem custo de mana, que mantém as habilidades',
  },
});