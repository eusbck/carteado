// Lumra, Bellow of the Woods
// Vigilance, reach
// Lumra's power and toughness are each equal to the number of lands you control.
// When Lumra enters, mill four cards. Then return all land cards from your graveyard to the battlefield tapped.
import { defineCard, etb, keywords, mill, selfGets } from '../../motor/api.ts';
import { terrenosDe, todosOsTerrenosDoCemiterio } from '../reanimar-terrenos.ts';

export default defineCard({
  name: 'Lumra, Bellow of the Woods',
  faces: [{
    abilities: [
      ...keywords('vigilance', 'reach'),
      // CR 604.3: habilidade que define característica
      selfGets((c) => { const n = terrenosDe(c.g, c.you).length; return [{ k: 'setPT', p: n, t: n }]; },
        'A força e a resistência de Lumra são iguais ao número de terrenos que você controla.', { cda: true }),
      etb(function* (c) {
        yield* mill(c.g, c.you, 4);
        // todas as cartas de terreno do cemitério, não só as moídas agora
        yield* todosOsTerrenosDoCemiterio(c.g, c.you);
      }, { text: 'Quando Lumra entra, moa quatro cartas. Depois, devolva todas as cartas de terreno do seu cemitério para o campo viradas.' }),
    ],
  }],
  rulings: {
    1: 'teste: vale também fora do campo',
  },
});
