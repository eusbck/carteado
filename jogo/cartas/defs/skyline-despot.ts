// Skyline Despot
// Flying
// When this creature enters, you become the monarch.
// At the beginning of your upkeep, if you're the monarch, create a 5/5 red Dragon creature token with flying.
import { becomeMonarch, createTokens, defineCard, etb, keyword, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Skyline Despot',
  faces: [{
    abilities: [
      keyword('flying'),
      // CR 725.1: tornar-se o monarca; rulings 3-5: as habilidades do monarca são do motor (CR 725.2)
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando esta criatura entra, você se torna o monarca.' }),
      // ruling 1 / CR 603.4: confere se você é o monarca ao disparar e de novo na resolução
      triggered(on.upkeep('you'), function* (c) {
        yield* createTokens(c.g, c.you, 'Dragon 5/5', 1);
      }, { condition: (c) => c.g.state.monarch === c.you, text: 'No início da sua manutenção, se você for o monarca, crie uma ficha de criatura Dragon vermelha 5/5 com voar.' }),
    ],
  }],
  rulings: {
    1: 'teste: CR 603.4: sem ser o monarca no início da manutenção, não dispara; deixando de ser antes de resolver, não cria',
    2: 'regra geral: CR 725.1 — sem monarca até um efeito criar um (motor/actions.ts becomeMonarch)',
    3: 'teste: ao entrar, você se torna o monarca e compra uma carta na sua etapa final',
    4: 'não se aplica: nenhuma carta destes decks dispara "quando você se torna o monarca"',
    5: 'regra geral: CR 725.2 — o gatilho de compra do monarca é do motor (motor/triggers.ts)',
  },
});
