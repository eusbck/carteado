// Icetill Explorer
// You may play an additional land on each of your turns.
// You may play lands from your graveyard.
// Landfall — Whenever a land you control enters, mill a card.
import { defineCard, mill, on, triggered } from '../../motor/api.ts';
import { terrenoAdicional, terrenosDoCemiterio } from '../terras.ts';

export default defineCard({
  name: 'Icetill Explorer',
  faces: [{
    abilities: [
      terrenoAdicional(),
      // rulings 2-3: só jogar terrenos, na hora normal; habilidades das cartas do cemitério continuam inativas
      terrenosDoCemiterio('icetill'),
      triggered(on.landfall(), function* (c) { yield* mill(c.g, c.you, 1); }, { text: 'Aterragem — Sempre que um terreno que você controla entra, moa uma carta.' }),
    ],
  }],
  rulings: {
    1: 'teste: com Exploration, você joga três terrenos no turno',
    2: 'regra geral: CR 305.2 e 505.6b — terreno do cemitério só quando se poderia jogar um terreno (motor/priority.ts landPlayOptions)',
    3: 'regra geral: CR 113.6 — habilidades de cartas no cemitério não funcionam (só jogar o terreno)',
  },
});
