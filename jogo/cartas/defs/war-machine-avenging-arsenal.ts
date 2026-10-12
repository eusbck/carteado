// War Machine, Avenging Arsenal
// Flying
// Whenever War Machine attacks, attacking modified creatures you control gain double strike until end of turn.
// (Equipment, Auras you control, and counters are modifications.)
import { controllerOf, defineCard, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { atacantes, modificada } from '../vingadores.ts';

export default defineCard({
  name: 'War Machine, Avenging Arsenal',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        const ids = atacantes(c.g).filter((id) => controllerOf(c.g, id) === c.you && modificada(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'double strike' }]);
      }, { text: 'Sempre que War Machine ataca, as criaturas atacantes modificadas que você controla ganham golpe duplo até o fim do turno. (Equipamentos, Auras que você controla e marcadores são modificações.)' }),
    ],
  }],
  rulings: {},
});