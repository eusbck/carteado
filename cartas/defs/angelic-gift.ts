// Angelic Gift — Enchant creature. When this Aura enters, draw a card. Enchanted creature has flying.
import { attachedGets, defineCard, draw, etb, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Angelic Gift',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [
      etb(function* (c) { yield* draw(c.g, c.you, 1); }, { text: 'Quando esta Aura entra, compre uma carta.' }),
      attachedGets(() => [{ k: 'addKeyword', kw: 'flying' }], 'A criatura encantada tem voar.'),
    ],
  }],
  rulings: {
    1: "teste: CR 608.3b: com o alvo ilegal, não entra e o gatilho de entrar não acontece",
  },
});
