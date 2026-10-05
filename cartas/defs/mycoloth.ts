// Mycoloth
// Devour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1
// counters on it.)
// At the beginning of your upkeep, create a 1/1 green Saproling creature token for each +1/+1 counter on this creature.
import { createTokens, defineCard, devour, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Mycoloth',
  faces: [{
    abilities: [
      devour(2),
      triggered(on.upkeep('you'), function* (c) {
        // ruling 3: conta os marcadores +1/+1, venham de onde vierem
        const n = c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0;
        if (n > 0) yield* createTokens(c.g, c.you, 'Saproling', n);
      }, { text: 'No início da sua manutenção, crie uma ficha de criatura Saproling verde 1/1 para cada marcador +1/+1 nesta criatura.' }),
    ],
  }],
  rulings: {
    1: 'não se aplica: nenhuma outra carta com devorar nos decks',
    2: 'teste: só devora criaturas que já estavam no campo, nunca a si mesma',
    3: 'regra geral: o texto conta os marcadores +1/+1 atuais',
    4: 'teste: pode não sacrificar nenhuma',
  },
});
