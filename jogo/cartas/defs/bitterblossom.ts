// Bitterblossom
// At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.
import { createTokens, defineCard, loseLife, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Bitterblossom',
  faces: [{
    abilities: [
      // rulings 4-5: obrigatório; perder vida não é pagamento
      triggered(on.upkeep('you'), function* (c) {
        loseLife(c.g, c.you, 1, c.source);
        yield* createTokens(c.g, c.you, 'Faerie Rogue', 1);
      }, { text: 'No início da sua manutenção, você perde 1 de vida e cria uma ficha de criatura Faerie Rogue preta 1/1 com voar.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: troca do nome do tipo tribal para kindred',
    2: 'regra geral: CR 308 — Kindred permite subtipos de criatura (dados Oracle)',
    3: 'regra geral: CR 308 — kindred é um tipo de carta (dados Oracle)',
    4: 'teste: na sua manutenção você perde 1 de vida e cria uma Faerie Rogue com voar',
    5: 'teste: na sua manutenção você perde 1 de vida e cria uma Faerie Rogue com voar',
  },
});
