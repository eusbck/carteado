// Angelic Sleuth
// Flying
// Whenever another permanent you control leaves the battlefield, if it had counters on it, investigate. (Create a Clue
// token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")
import { defineCard, investigate, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Angelic Sleuth',
  faces: [{
    abilities: [
      keyword('flying'),
      // "olha para trás" (CR 603.10a): controlador e marcadores como estavam no campo
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || e.old === c.source) return false;
        const l = c.g.state.lki[e.old];
        if (!l || l.chars.controller !== c.you) return false;
        return Object.values(l.obj.counters ?? {}).some((n) => n > 0);
      }), function* (c) {
        yield* investigate(c.g, c.you, 1);
      }, { text: 'Sempre que outro permanente que você controla sai do campo, se ele tinha marcadores, investigue.' }),
    ],
  }],
  rulings: {},
});
