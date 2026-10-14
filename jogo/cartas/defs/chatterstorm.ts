// Chatterstorm
// Create a 1/1 green Squirrel creature token.
// Storm (When you cast this spell, copy it for each spell cast before it this turn.)
import { createTokens, defineCard } from '../../motor/api.ts';
import { storm } from '../esquilos.ts';

export default defineCard({
  name: 'Chatterstorm',
  faces: [{
    abilities: [storm()],
    spell: {
      *effect(c) { yield* createTokens(c.g, c.you, 'Squirrel', 1); },
    },
  }],
  rulings: {
    1: 'teste: depois de duas mágicas no turno (uma de cada jogador), cria três Squirrels; as cópias não contam para a próxima tempestade',
    2: 'teste: depois de duas mágicas no turno (uma de cada jogador), cria três Squirrels; as cópias não contam para a próxima tempestade',
    3: 'regra geral: CR 707.10 — cada cópia é uma mágica separada na pilha',
    4: 'regra geral: CR 702.40a — a tempestade é uma habilidade desencadeada; anulada, não há cópias',
    5: 'não se aplica: Chatterstorm não tem alvos',
  },
});
