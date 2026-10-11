// Voracious Fell Beast
// Flying
// When this creature enters, each opponent sacrifices a creature of their choice. Create a Food token for each creature
// sacrificed this way. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")
import { createTokens, defineCard, eachSacrifices, etb, isCreature, keyword } from '../../motor/api.ts';

export default defineCard({
  name: 'Voracious Fell Beast',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const escolhidas = yield* eachSacrifices(c, c.g.opponents(c.you), (id) => isCreature(c.g, id), 1, 'uma criatura');
        // conta as que foram mesmo sacrificadas (saíram do campo)
        const n = escolhidas.filter((id) => c.g.state.objects[id]?.zone !== 'battlefield').length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Food', n);
      }, { text: 'Quando esta criatura entra, cada oponente sacrifica uma criatura à escolha dele. Crie uma ficha de Food para cada criatura sacrificada assim.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 205.3g — Food é subtipo de artefato, nunca tipo de criatura (cartas/fichas.ts)',
    2: 'regra geral: CR 118.3 — um permanente sacrificado paga um custo só (motor/costs.ts)',
    3: 'não se aplica: a nota oficial é uma brincadeira, sem regra',
  },
});
