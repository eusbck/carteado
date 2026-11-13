// Twitch
// You may tap or untap target artifact, creature, or land.
// Draw a card.
import { defineCard, draw, tgt } from '../../motor/api.ts';
import { alvoArtefatoCriaturaOuTerreno, viraOuDesvira } from '../twitch.ts';

export default defineCard({
  name: 'Twitch',
  faces: [{
    spell: {
      targets: [alvoArtefatoCriaturaOuTerreno()],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* viraOuDesvira(c, id, 'Twitch');
        yield* draw(c.g, c.you, 1);
      },
    },
  }],
  rulings: { 1: 'teste: com o alvo ilegal na resolução, a mágica não resolve e você não compra' },
});
