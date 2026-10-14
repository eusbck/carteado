// Court of Grace
// When this enchantment enters, you become the monarch.
// At the beginning of your upkeep, create a 1/1 white Spirit creature token with flying. If you're the monarch, create a
// 4/4 white Angel creature token with flying instead.
import { becomeMonarch, createTokens, defineCard, etb, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Court of Grace',
  faces: [{
    abilities: [
      etb(function* (c) { becomeMonarch(c.g, c.you); }, { text: 'Quando este encantamento entra, você se torna o monarca.' }),
      // o monarca é conferido na resolução
      triggered(on.upkeep('you'), function* (c) {
        yield* createTokens(c.g, c.you, c.g.state.monarch === c.you ? 'Angel' : 'Spirit 1/1', 1);
      }, { text: 'No início da sua manutenção, crie uma ficha de criatura Spirit 1/1 branca com voar. Se você for o monarca, crie uma ficha de criatura Angel 4/4 branca com voar em vez disso.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 725.1 — há um monarca só; quem se torna monarca tira o anterior (motor/actions.ts becomeMonarch)',
    2: 'regra geral: CR 725.2 — o monarca compra na etapa final e perde o posto por dano de combate (motor/triggers.ts)',
    3: 'regra geral: CR 725.2 — a compra já na pilha acontece mesmo que outro vire o monarca',
    4: 'regra geral: CR 725.4 — quem sai da partida passa o posto (motor/sba.ts)',
    5: 'regra geral: CR 725.2 — dano que faz o monarca perder não passa o posto pelo gatilho',
  },
});
