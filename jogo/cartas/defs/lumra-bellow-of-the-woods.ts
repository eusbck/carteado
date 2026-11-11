// Lumra, Bellow of the Woods
// Reach, vigilance
// Lumra's power and toughness are each equal to the number of lands you control.
// When Lumra enters, mill four cards. Then return all land cards from your graveyard to the battlefield tapped.
import { controlledBy, defineCard, etb, isLand, keyword, mill, selfGets } from '../../motor/api.ts';
import { terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Lumra, Bellow of the Woods',
  faces: [{
    abilities: [
      keyword('reach'), keyword('vigilance'),
      selfGets((c) => { const n = controlledBy(c.g, c.you, (id) => isLand(c.g, id)).length; return [{ k: 'setPT', p: n, t: n }]; },
        'A força e a resistência de Lumra são iguais ao número de terrenos que você controla.', { cda: true }),
      etb(function* (c) { yield* mill(c.g, c.you, 4); yield* terrenosDoCemiterio(c); },
        { text: 'Quando Lumra entra, moa quatro cartas. Depois devolva todas as cartas de terreno do seu cemitério ao campo de batalha viradas.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 604.3 — a força e a resistência valem em todas as zonas' },
});
