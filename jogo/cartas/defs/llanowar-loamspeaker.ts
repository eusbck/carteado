// Llanowar Loamspeaker
// {T}: Add one mana of any color.
// {T}: Target land you control becomes a 3/3 Elemental creature with haste until end of turn. It's still a land.
// Activate only as a sorcery.
import { activated, and, defineCard, is, mana, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Llanowar Loamspeaker',
  faces: [{
    abilities: [
      mana('any'),
      activated('{T}', function* (c) {
        const id = tgt(c);
        // ruling 1: não desvira o terreno; continua terreno (camada 4: só acrescenta tipos)
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addTypes', types: ['Creature'], subtypes: ['Elemental'] }, { k: 'setPT', p: 3, t: 3 }, { k: 'addKeyword', kw: 'haste' }]);
      }, {
        timing: 'sorcery',
        targets: [t.land(and(is.yours), 'terreno alvo que você controla')],
        text: '{T}: Até o fim do turno, o terreno alvo que você controla se torna uma criatura Elemental 3/3 com ímpeto. Continua sendo terreno. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: o terreno vira criatura 3/3 com ímpeto e continua terreno; virado continua virado',
  },
});
