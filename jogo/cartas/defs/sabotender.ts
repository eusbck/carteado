// Sabotender
// Reach
// Landfall — Whenever a land you control enters, this creature deals 1 damage to each opponent.
import { defineCard, keyword, on, triggered } from '../../motor/api.ts';
import { danoACadaOponente } from '../terras.ts';

export default defineCard({
  name: 'Sabotender',
  faces: [{
    abilities: [
      keyword('reach'),
      triggered(on.landfall(), function* (c) { danoACadaOponente(c, 1); }, { text: 'Aterragem — Sempre que um terreno que você controla entra, esta criatura causa 1 ponto de dano a cada oponente.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.3b — vários gatilhos de aterragem vão para a pilha na ordem que você escolher',
    2: 'regra geral: CR 603.6a — permanente que já está no campo e vira terreno não dispara (motor/dsl.ts on.landfall)',
    3: 'teste: um terreno posto no campo por um efeito também dispara',
  },
});
