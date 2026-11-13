// Gift of Perfection
// Each opponent reveals cards from the top of their library until they reveal a creature card. Assimilate one of the
// creature cards revealed this way. Then each opponent puts the other cards they revealed this way on the bottom of
// their library in a random order. (To assimilate a card, put it onto the battlefield under your control with a +1/+1
// counter. It's a Borg artifact creature and loses all other creature types.)
import { assimilateCard, chars, chooseItems, defineCard, nameOf, objItem } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { fundoAleatorio } from '../borg.ts';

export default defineCard({
  name: 'Gift of Perfection',
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const reveladas: ObjId[] = [];
        const criaturas: ObjId[] = [];
        for (const op of c.g.apnap().filter((p) => c.g.isOpponent(c.you, p))) {
          const lib = s.zones.library[op];
          const i = lib.findIndex((id) => chars(c.g, id).types.includes('Creature'));
          const tiradas = i < 0 ? [...lib] : lib.slice(0, i + 1);
          if (!tiradas.length) continue;
          c.g.log(`${s.players[op].name} revela ${tiradas.map((id) => nameOf(c.g, id)).join(', ')}.`);
          reveladas.push(...tiradas);
          if (i >= 0) criaturas.push(lib[i]);
        }
        let escolhida: ObjId | null = null;
        if (criaturas.length) {
          const [esc] = yield* chooseItems(c.g, c.you, 'Gift of Perfection: escolha a carta de criatura revelada que você vai assimilar', criaturas.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
          escolhida = Number(esc);
          yield* assimilateCard(c.g, c.you, escolhida, c.source, 'Gift of Perfection');
        }
        // as outras reveladas (inclusive as outras criaturas) vão para o fundo, em ordem aleatória
        yield* fundoAleatorio(c.g, reveladas.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library'));
      },
    },
  }],
  rulings: {},
});
