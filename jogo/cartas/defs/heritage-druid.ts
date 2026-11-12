// Heritage Druid
// Tap three untapped Elves you control: Add {G}{G}{G}.
import { defineCard, isSubtype, mana, type ManaAbilityDef } from '../../motor/api.ts';

// ruling 1 / CR 302.6: o custo não tem {T}, então servem a própria Heritage Druid e Elfos com enjoo de invocação
const habilidade: ManaAbilityDef = {
  ...mana('GGG', { text: 'Vire três Elfos desvirados que você controla: Adicione {G}{G}{G}.' }),
  cost: [{ k: 'tapCreatures', n: 3, includeSelf: true, label: 'Elfos desvirados', filter: (c, id) => isSubtype(c.g, id, 'Elf') }],
};

export default defineCard({
  name: 'Heritage Druid',
  faces: [{ abilities: [habilidade] }],
  rulings: {
    1: 'teste: vira ela mesma e Elfos com enjoo de invocação para gerar {G}{G}{G}',
  },
});
