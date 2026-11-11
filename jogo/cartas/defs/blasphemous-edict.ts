// Blasphemous Edict
// You may pay {B} rather than pay this spell's mana cost if there are thirteen or more creatures on the battlefield.
// Each player sacrifices thirteen creatures of their choice.
import { allCreatures, defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Blasphemous Edict',
  faces: [{
    altCosts: [{ key: 'treze', label: 'pagar {B} (13 ou mais criaturas no campo)', zone: 'hand', mana: '{B}', condition: (c) => allCreatures(c.g).length >= 13 }],
    spell: { *effect(c) { yield* eachSacrifices(c, c.g.playersInGame(), (id) => isCreature(c.g, id), 13, 'treze criaturas'); } },
  }],
  rulings: {
    1: 'regra geral: CR 118.9 — o custo alternativo só vale com 13 ou mais criaturas no campo quando você conjura',
    2: 'regra geral: CR 701.21a — quem tem menos de 13 sacrifica todas',
  },
});
