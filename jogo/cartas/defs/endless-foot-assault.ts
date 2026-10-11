// Endless Foot Assault
// Squad {1}{W} (As an additional cost to cast this spell, you may pay {1}{W} any number of times. When this enchantment
// enters, create that many tokens that are copies of it.)
// Whenever you attack, for each opponent, create a 1/1 black Ninja creature token that's tapped and attacking that
// player.
import { createTokens, defineCard, on, squad, triggered } from '../../motor/api.ts';

const esq = squad('{1}{W}');

export default defineCard({
  name: 'Endless Foot Assault',
  faces: [{
    // CR 702.157a: custo adicional repetível + gatilho de entrar que cria as cópias
    additionalCosts: [esq.cost],
    abilities: [
      esq.trigger,
      // CR 508.3d "sempre que você ataca"; as fichas entram atacando sem terem sido declaradas (506.3, ruling 7)
      triggered(on.youAttack(), function* (c) {
        for (const op of c.g.opponents(c.you)) {
          if (c.g.state.players[op].left) continue;
          yield* createTokens(c.g, c.you, 'Ninja', 1, { tapped: true, attacking: { kind: 'player', id: op } });
        }
      }, { text: 'Sempre que você ataca, para cada oponente, crie uma ficha de criatura Ninja preta 1/1 virada e atacando esse jogador.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.157a — o gatilho é a habilidade de esquadrão do permanente (motor/conjurar-alternativo.ts)',
    2: 'regra geral: CR 707.10, 111.1 — as fichas não são conjuradas',
    3: 'teste: anulada, não cria cópias',
    4: 'teste: com o esquadrão pago duas vezes, duas cópias',
    5: 'teste: uma ficha para cada oponente, mesmo os não atacados',
    6: 'teste: se sair antes do gatilho resolver, cria as cópias mesmo assim',
    7: 'teste: as fichas não foram declaradas atacantes',
  },
});
