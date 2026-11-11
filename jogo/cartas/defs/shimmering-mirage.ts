// Shimmering Mirage
// Target land becomes the basic land type of your choice until end of turn.
// Draw a card.
import { chars, chooseOne, defineCard, draw, nameOf, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

const COR: Record<string, string> = { Plains: 'W', Island: 'U', Swamp: 'B', Mountain: 'R', Forest: 'G' };
// CR 205.3i: os tipos de terreno (os outros subtipos, como os de criatura de um terreno criatura, ficam)
const TIPOS_DE_TERRENO = ['Cave', 'Desert', 'Forest', 'Gate', 'Island', 'Lair', 'Locus', 'Mine', 'Mountain', 'Plains', 'Planet', 'Power-Plant', 'Sphere', 'Swamp', 'Tower', 'Town', "Urza's"];

export default defineCard({
  name: 'Shimmering Mirage',
  faces: [{
    spell: {
      targets: [t.land()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) {
          const tipo = yield* chooseOne(c.g, c.you, `Shimmering Mirage: escolha o tipo básico de terreno de ${nameOf(c.g, id)}`, Object.keys(COR).map((x) => ({ id: x, label: x })));
          const atual = chars(c.g, id);
          // CR 305.7: perde os tipos de terreno antigos e as habilidades do texto e deles, e ganha a de mana do tipo novo;
          // os tipos de carta e supertipos ficam
          untilEndOfTurn(c, [id], [
            { k: 'setTypes', types: [...atual.types], subtypes: [...atual.subtypes.filter((s) => !TIPOS_DE_TERRENO.includes(s)), tipo], keepSupertypes: true },
            { k: 'loseAllAbilities' },
            { k: 'addAbility', id: `basic:${COR[tipo]}` },
          ]);
        }
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: {},
});
