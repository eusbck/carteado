// Scuzzback Scrounger
// At the beginning of your first main phase, you may blight 1. If you do, create a Treasure token.
import { blight, createTokens, defineCard, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Scuzzback Scrounger',
  faces: [{
    abilities: [triggered(on.firstMain(), function* (c) {
      // rulings 1-2, 4-6: um marcador numa criatura sua (qualquer resistência); sem criatura, não dá para fazer
      const alvo = yield* blight(c.g, c.you, 1, true);
      if (alvo !== null) yield* createTokens(c.g, c.you, 'Treasure', 1);
    }, { text: 'No início da sua primeira fase principal, você pode fazer blight 1. Se fizer isso, crie uma ficha de Tesouro.' })],
  }],
  rulings: {
    1: 'regra geral: CR 701.68 — a criatura não precisa sobreviver',
    2: 'regra geral: CR 701.68 — todos os marcadores numa só criatura',
    3: 'não se aplica: blight aqui é efeito, não custo',
    4: 'teste: sem criatura, não faz blight nem cria Tesouro',
    5: 'regra geral: CR 704.5q — marcadores vistos ao morrer',
    6: 'regra geral: CR 704.5q — +1/+1 e -1/-1 se anulam',
  },
});
