// Skorpekh Destroyer
// Deathtouch
// Hyperphase Threshers — Whenever an artifact you control enters, this creature gains first strike until end of turn.
import { and, defineCard, is, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Skorpekh Destroyer',
  faces: [{
    abilities: [
      keyword('deathtouch'),
      triggered(on.enters(and(is.artifact, is.yours)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'addKeyword', kw: 'first strike' }]);
      }, { text: 'Hyperphase Threshers — Sempre que um artefato que você controla entra, esta criatura ganha iniciativa até o fim do turno.' }),
    ],
  }],
  rulings: {},
});