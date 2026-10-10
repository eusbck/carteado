// Padeem, Consul of Innovation
// Artifacts you control have hexproof. (They can't be the targets of spells or abilities your opponents control.)
// At the beginning of your upkeep, if you control the artifact with the greatest mana value or tied for the greatest mana value, draw a card.
import { and, anthem, defineCard, draw, is, isType, manaValue, on, permanentsMatching, triggered } from '../../motor/api.ts';
import { artifacts } from '../artefatos.ts';

export default defineCard({
  name: "Padeem, Consul of Innovation",
  faces: [{
    abilities: [
      anthem(and(is.yours, is.artifact), () => [{ k: 'addKeyword', kw: 'hexproof' }], 'Artefatos que você controla têm resistência a magia.'),
      triggered(on.upkeep('you'), function*(c) { yield* draw(c.g, c.you, 1); }, {
        condition: (c) => {
          const mine = artifacts(c); if (!mine.length) return false;
          const greatest = Math.max(...mine.map((id) => manaValue(c.g, id)));
          return !permanentsMatching(c.g, (id) => isType(c.g, id, 'Artifact') && manaValue(c.g, id) > greatest).length;
        }, text: 'Na sua manutenção, se controla um artefato empatado no maior valor de mana do campo, compre uma carta.'
      }),
    ]
  }],
  rulings: {
    "1": "teste: compara apenas artefatos no campo; permanentes de outros tipos não entram na comparação.",
    "2": "CR 107.3g: X é zero no campo.",
    "3": "CR 603.4: teste: sem o maior valor na manutenção, não dispara; não há prioridade antes de começar a manutenção.",
    "4": "CR 603.4: teste: perde o maior valor antes da resolução e não compra."
  },
});
