// Morbid Opportunist
// Whenever one or more other creatures die, draw a card. This ability triggers only once each turn.
import { defineCard, draw, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Morbid Opportunist',
  faces: [{
    abilities: [triggered(on.batch((evs, c) => evs.some((e) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && e.old !== c.source && !!c.g.state.lki[e.old]?.chars.types.includes('Creature'))), function* (c) {
      yield* draw(c.g, c.you, 1);
    }, { oncePerTurn: true, text: 'Sempre que uma ou mais outras criaturas morrem, compre uma carta. Esta habilidade só dispara uma vez a cada turno.' })],
  }],
  rulings: { 1: 'teste: CR 603.10a: dispara mesmo morrendo junto com as outras' },
});
