// Nyx-Fleece Ram
// At the beginning of your upkeep, you gain 1 life.
import { defineCard, gainLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Nyx-Fleece Ram',
  faces: [{
    abilities: [triggered(on.upkeep('you'), function* (c) { gainLife(c.g, c.you, 1, c.source); }, { text: 'No início da sua manutenção, você ganha 1 de vida.' })],
  }],
  rulings: {},
});
