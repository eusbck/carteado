// Sheoldred's Edict
// Choose one —
// • Each opponent sacrifices a nontoken creature of their choice.
// • Each opponent sacrifices a creature token of their choice.
// • Each opponent sacrifices a planeswalker of their choice.
import { defineCard, eachSacrifices, isCreature, isType, modal } from '../../motor/api.ts';

export default defineCard({
  name: "Sheoldred's Edict",
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'Cada oponente sacrifica uma criatura que não é ficha à escolha dele',
          *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id) && !c.g.state.objects[id].isToken, 1, 'uma criatura que não é ficha'); },
        },
        {
          text: 'Cada oponente sacrifica uma ficha de criatura à escolha dele',
          *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id) && c.g.state.objects[id].isToken, 1, 'uma ficha de criatura'); },
        },
        {
          text: 'Cada oponente sacrifica um planeswalker à escolha dele',
          *effect(c) { yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isType(c.g, id, 'Planeswalker'), 1, 'um planeswalker'); },
        },
      ]),
    },
  }],
  rulings: {},
});
