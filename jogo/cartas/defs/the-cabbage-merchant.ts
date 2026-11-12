// The Cabbage Merchant
// Whenever an opponent casts a noncreature spell, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this
// token: You gain 3 life.")
// Whenever a creature deals combat damage to you, sacrifice a Food token.
// Tap two untapped Foods you control: Add one mana of any color.
import { createTokens, defineCard, eachSacrifices, isCreature, lkiChars, mana, on, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import type { ObjId } from '../../motor/types.ts';
import { COMIDA } from '../tartarugas.ts';

const ehFood = (g: G, id: ObjId): boolean => {
  const ch = lkiChars(g, id);
  return !!ch && ch.types.includes('Artifact') && ch.subtypes.includes('Food');
};

export default defineCard({
  name: 'The Cabbage Merchant',
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'cast' && c.g.isOpponent(c.you, e.player) && !!c.g.state.objects[e.obj] && !isCreature(c.g, e.obj)), function* (c) {
        yield* createTokens(c.g, c.you, 'Food', 1);
      }, { text: 'Sempre que um oponente conjura uma mágica que não é de criatura, crie uma ficha Food.' }),
      // um gatilho por criatura que causa dano de combate a você; a ficha é sacrificada sem a habilidade dela (ruling 4)
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.target.id === c.you && !!lkiChars(c.g, e.source)?.types.includes('Creature')), function* (c) {
        yield* eachSacrifices(c, [c.you], (id) => !!c.g.state.objects[id]?.isToken && ehFood(c.g, id), 1, 'uma ficha Food');
      }, { text: 'Sempre que uma criatura causa dano de combate a você, sacrifique uma ficha Food.' }),
      // CR 605.1a: habilidade de mana; virar as Foods é custo (não é o símbolo {T})
      {
        ...mana('any', { text: 'Vire duas Foods desviradas que você controla: Adicione uma mana de qualquer cor.' }),
        cost: [{ k: 'tapPermanents', n: 2, filter: (c, id) => ehFood(c.g, id), label: 'Foods desviradas' }],
      },
    ],
  }],
  rulings: {
    1: COMIDA.tipo,
    2: COMIDA.qualquer,
    3: COMIDA.naoComa,
    4: 'teste: a criatura que causa dano de combate a você faz sacrificar uma ficha Food, sem ganhar vida',
    5: COMIDA.alvos,
  },
});
