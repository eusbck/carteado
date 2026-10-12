// Firebird, Blazing Ranger
// Flying
// Whenever Firebird attacks, other attacking creatures get +X/+0 until end of turn, where X is Firebird's power.
import { defineCard, keyword, on, power, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { atacantes } from '../vingadores.ts';

export default defineCard({
  name: 'Firebird, Blazing Ranger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
        const x = power(c.g, c.source);
        const ids = atacantes(c.g).filter((id) => id !== c.source);
        if (x > 0 && ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: x, t: 0 }]);
      }, { text: 'Sempre que Firebird ataca, as outras criaturas atacantes recebem +X/+0 até o fim do turno, sendo X a força de Firebird.' }),
    ],
  }],
  rulings: {},
});