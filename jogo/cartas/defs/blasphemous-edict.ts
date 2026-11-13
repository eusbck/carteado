// Blasphemous Edict
// You may pay {B} rather than pay this spell's mana cost if there are thirteen or more creatures on the battlefield.
// Each player sacrifices thirteen creatures of their choice.
import { allCreatures, defineCard, eachSacrifices, isCreature } from '../../motor/api.ts';

export default defineCard({
  name: 'Blasphemous Edict',
  faces: [{
    // CR 118.9: custo alternativo com condição
    altCosts: [{ key: 'blasphemous', label: 'pagar {B} (treze ou mais criaturas no campo)', zone: 'hand', mana: '{B}', parts: [], condition: (c) => allCreatures(c.g).length >= 13 }],
    spell: {
      *effect(c) {
        // ruling 1: quem tem menos de treze sacrifica todas; ruling 2: escolhas em ordem de turno, ao mesmo tempo
        yield* eachSacrifices(c, c.g.apnap(), (id) => isCreature(c.g, id), 13, 'treze criaturas');
      },
    },
  }],
  rulings: {
    1: 'teste: cada jogador sacrifica treze criaturas; quem tem menos sacrifica todas',
    2: 'regra geral: CR 101.4 — escolhas em ordem de turno, sacrifícios ao mesmo tempo (motor/efeitos.ts eachSacrifices)',
  },
});
