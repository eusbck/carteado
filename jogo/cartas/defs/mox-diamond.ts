// Mox Diamond
// If this artifact would enter, you may discard a land card instead. If you do, put this artifact onto the
// battlefield. If you don't, put it into its owner's graveyard.
// {T}: Add one mana of any color.
import { asEnters, defineCard, discard, isLand, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Mox Diamond',
  faces: [{
    abilities: [
      // CR 614.1c: substituição de entrar; sem descartar, vai para o cemitério e nunca entra (ruling 1: não dispara nada)
      asEnters(function* (c, ev) {
        const descartada = yield* discard(c.g, ev.controller, 1, { filter: (id) => isLand(c.g, id), upTo: true });
        if (!descartada.length) ev.instead = 'graveyard';
      }, 'Se este artefato fosse entrar, em vez disso você pode descartar uma carta de terreno. Se fizer isso, coloque este artefato no campo. Se não fizer, coloque-o no cemitério do dono.'),
      mana('any'),
    ],
  }],
  rulings: {
    1: 'teste: sem descartar um terreno, vai para o cemitério sem entrar e não dispara nada',
  },
});
