// Namor, Atlantean King
// Flying
// Whenever you cast a noncreature spell, create a 1/1 blue Merfolk creature token.
// Whenever Namor attacks a player who has more life than you, other creatures you control attacking that player get
// +2/+0 until end of turn.
import { controllerOf, createTokens, defineCard, isCreature, keyword, on, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { aoConjurarNaoCriatura } from '../quarteto.ts';

export default defineCard({
  name: 'Namor, Atlantean King',
  faces: [{
    abilities: [
      keyword('flying'),
      triggered(aoConjurarNaoCriatura(), function* (c) { yield* createTokens(c.g, c.you, 'Merfolk', 1); }, {
        text: 'Sempre que você conjura uma mágica que não é de criatura, crie uma ficha de criatura Merfolk 1/1 azul.',
      }),
      // a condição faz parte do evento: só dispara atacando um jogador que tem mais vida que você
      triggered(on.custom((e, c) => {
        if (e.type !== 'attackers') return false;
        const a = e.attackers.find((x) => x.obj === c.source);
        if (!a || a.target.kind !== 'player') return false;
        return c.g.state.players[a.target.id].life > c.g.state.players[c.you].life ? { jogador: a.target.id } : false;
      }), function* (c) {
        const quem = c.event.jogador as PlayerId;
        const outras = (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && a.id !== c.source && a.target.kind === 'player' && a.target.id === quem
          && c.g.state.objects[a.id]?.zone === 'battlefield' && controllerOf(c.g, a.id) === c.you && isCreature(c.g, a.id)).map((a) => a.id);
        if (outras.length) untilEndOfTurn(c, outras, [{ k: 'pt', p: 2, t: 0 }]);
      }, { text: 'Sempre que Namor ataca um jogador que tem mais vida que você, as outras criaturas que você controla atacando esse jogador recebem +2/+0 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
