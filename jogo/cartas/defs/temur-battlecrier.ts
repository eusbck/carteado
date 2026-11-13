// Temur Battlecrier
// During your turn, spells you cast cost {1} less to cast for each creature you control with power 4 or greater.
import { defineCard, staticAbility } from '../../motor/api.ts';
import { criaturasFortes } from '../dragoes.ts';

export default defineCard({
  name: 'Temur Battlecrier',
  faces: [{
    abilities: [
      // CR 601.2f: reduz só o genérico
      staticAbility({
        rules: {
          costModifier: (c, spell) => {
            if (spell.controller !== c.you || c.g.state.turn.active !== c.you) return null;
            const n = criaturasFortes(c.g, c.you);
            return n > 0 ? { reduce: n } : null;
          },
        },
        text: 'Durante o seu turno, as mágicas que você conjura custam {1} a menos para cada criatura com força 4 ou mais que você controla.',
      }),
    ],
  }],
  rulings: {},
});
