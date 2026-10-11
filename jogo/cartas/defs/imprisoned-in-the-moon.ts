// Imprisoned in the Moon
// Enchant creature, land, or planeswalker
// Enchanted permanent is a colorless land with "{T}: Add {C}" and loses all other card types and abilities.
import { attachedGets, defineAbility, defineCard, is, mana, or, printedChars, t } from '../../motor/api.ts';

const MANA = defineAbility('Imprisoned in the Moon:mana', mana('C'));
// CR 205.3i: os tipos de terreno
const TIPOS_DE_TERRENO = ['Cave', 'Desert', 'Forest', 'Gate', 'Island', 'Lair', 'Locus', 'Mine', 'Mountain', 'Plains', 'Planet', 'Power-Plant', 'Sphere', 'Swamp', 'Tower', 'Town', "Urza's"];

export default defineCard({
  name: 'Imprisoned in the Moon',
  faces: [{
    enchant: t.permanent(or(is.creature, is.land, is.planeswalker), 'criatura, terreno ou planeswalker'),
    abilities: [
      // camada 4 (tipos), 5 (cor) e 6 (perde as habilidades e ganha a de mana). Ruling 4: os supertipos ficam;
      // ruling 5: os tipos de terreno ficam, mas a habilidade de mana intrínseca deles some; ruling 2: o que ela ganhar
      // depois vale (ordem de registro na camada 6)
      attachedGets((c, o) => {
        const atual = c.g.computing?.get(o.id) ?? printedChars(o.def, o.face, o.owner);
        return [
          { k: 'setTypes', types: ['Land'], subtypes: atual.subtypes.filter((st) => TIPOS_DE_TERRENO.includes(st)), keepSupertypes: true },
          { k: 'setColors', colors: [] },
          { k: 'loseAllAbilities' },
          { k: 'addAbility', id: MANA.id! },
        ];
      }, 'A permanente encantada é um terreno incolor com "{T}: Adicione {C}" e perde todos os outros tipos de carta e habilidades.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 606.3 — a habilidade de lealdade não pede que o planeswalker esteja desvirado (motor/costs.ts)',
    2: 'teste: a criatura encantada vira um terreno incolor que só tem "{T}: Adicione {C}"',
    3: 'teste: o planeswalker encantado deixa de ser planeswalker, não tem habilidades de lealdade e fica com os marcadores',
    4: 'teste: a criatura encantada vira um terreno incolor que só tem "{T}: Adicione {C}"',
    5: 'teste: uma Plains encantada continua Plains, mas só gera {C}',
  },
});
