// Swarmyard
// {T}: Add {C}.
// {T}: Regenerate target Insect, Rat, Spider, or Squirrel. (The next time it would be destroyed this turn, instead tap
// it, remove it from combat, and heal all damage on it.)
import { activated, chars, defineCard, mana, regenerate, t, tgt } from '../../motor/api.ts';

const TIPOS = ['Insect', 'Rat', 'Spider', 'Squirrel'];

export default defineCard({
  name: 'Swarmyard',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) regenerate(c, id);
      }, {
        targets: [t.creature((c, id) => chars(c.g, id).subtypes.some((s) => TIPOS.includes(s)), 'Insect, Rat, Spider ou Squirrel alvo')],
        text: '{T}: Regenere o Insect, Rat, Spider ou Squirrel alvo.',
      }),
    ],
  }],
  rulings: {},
});
