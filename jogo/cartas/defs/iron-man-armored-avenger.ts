// Iron Man, Armored Avenger
// Flying
// Whenever you draw a card, put a +1/+1 counter on target creature.
// Whenever Iron Man attacks, other attacking modified creatures gain flying until end of turn. (Equipment, Auras you
// control, and counters are modifications.)
import { addCounters, defineCard, keyword, on, t, tgt, triggered, untilEndOfTurn } from '../../motor/api.ts';
import { atacantes, modificada } from '../vingadores.ts';

export default defineCard({
  name: 'Iron Man, Armored Avenger',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(on.custom((e, c) => e.type === 'draw' && e.player === c.you), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { targets: [t.creature()], text: 'Sempre que você compra uma carta, coloque um marcador +1/+1 na criatura alvo.' }),
      triggered(on.selfAttacks(), function* (c) {
        const ids = atacantes(c.g).filter((id) => id !== c.source && modificada(c.g, id));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'flying' }]);
      }, { text: 'Sempre que Iron Man ataca, as outras criaturas atacantes modificadas ganham voar até o fim do turno. (Equipamentos, Auras que você controla e marcadores são modificações.)' }),
    ],
  }],
  rulings: {},
});