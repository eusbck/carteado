// Angelic Chorus
// Whenever a creature you control enters, you gain life equal to its toughness.
import { and, defineCard, gainLife, is, on, triggered } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { resistenciaDe } from '../miku.ts';

export default defineCard({
  name: 'Angelic Chorus',
  faces: [{
    abilities: [
      // rulings 1-2: só quando a criatura entra no campo, não quando algo vira criatura, entra em fase ou muda de controlador
      triggered(on.enters(and(is.creature, is.yours)), function* (c) {
        gainLife(c.g, c.you, resistenciaDe(c.g, c.event.obj as ObjId), c.source);
      }, { text: 'Sempre que uma criatura que você controla entra, você ganha vida igual à resistência dela.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.6a — só dispara com a entrada no campo, não quando uma permanente vira criatura (motor/dsl.ts on.enters)',
    2: 'regra geral: CR 702.26d — entrar em fase ou mudar de controlador não é entrar no campo (motor/dsl.ts on.enters)',
  },
});