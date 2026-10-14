// Garruk's Packleader
// Whenever another creature you control with power 3 or greater enters, you may draw a card.
import { and, defineCard, draw, is, on, power, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Garruk's Packleader",
  faces: [{
    abilities: [
      // a força só é vista para disparar (rulings 1-2); entrando junto com Packleader também dispara (ruling 3)
      triggered(on.enters(and(is.creature, is.yours, is.other, (c, id) => power(c.g, id) >= 3)), function* (c) {
        if (yield* yesNo(c.g, c.you, "Garruk's Packleader: comprar uma carta?")) yield* draw(c.g, c.you, 1);
      }, { text: 'Sempre que outra criatura com força 3 ou mais que você controla entra, você pode comprar uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: outra criatura com força 3 ou mais entra: você pode comprar uma carta; com força 2, não dispara',
    2: 'regra geral: CR 603.2 — a condição do gatilho só é vista quando o evento acontece (motor/triggers.ts)',
    3: 'regra geral: CR 603.6a — as habilidades de entrar olham o campo depois do evento, com os que entraram juntos (motor/triggers.ts)',
  },
});
