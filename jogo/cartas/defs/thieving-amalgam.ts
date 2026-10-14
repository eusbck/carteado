// Thieving Amalgam
// At the beginning of each opponent's upkeep, you manifest the top card of that player's library. (Put it onto the
// battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)
// Whenever a creature you control but don't own dies, its owner loses 2 life and you gain 2 life.
import { defineCard, gainLife, loseLife, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { manifestaTopoDe } from '../roubo.ts';

export default defineCard({
  name: 'Thieving Amalgam',
  faces: [{
    abilities: [
      triggered(on.upkeep('opponent'), function* (c) {
        yield* manifestaTopoDe(c, c.event.active as PlayerId);
      }, { text: 'No início da manutenção de cada oponente, você manifesta a carta do topo do grimório desse jogador.' }),
      // "olha para trás" (CR 603.10a): controlador e dono como estavam no campo
      triggered(on.dies((c, lki, old) => lki.controller === c.you && old.owner !== c.you), function* (c) {
        const dono = (c.event as { owner?: PlayerId }).owner;
        // ruling 3: se o dono saiu da partida, ninguém perde vida, mas você ganha
        if (dono !== undefined && !c.g.state.players[dono].left) loseLife(c.g, dono, 2, c.source);
        gainLife(c.g, c.you, 2, c.source);
      }, { text: 'Sempre que uma criatura que você controla mas não possui morre, o dono dela perde 2 de vida e você ganha 2 de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: no início da manutenção de cada oponente, manifesta o topo dele sob o seu controle; ele não vê a carta',
    2: 'regra geral: CR 704.3 — as ações de estado acontecem juntas; com 0 de vida você perde antes de o gatilho resolver (motor/sba.ts)',
    3: 'teste: quando a criatura de outro dono morre, o dono perde 2 e você ganha 2',
    4: 'regra geral: CR 903.4 — a identidade de cor não limita a mana que você produz para virar a carta para cima (motor/mecanicas.ts turnFaceUp)',
    5: 'regra geral: CR 800.4a — quem sai da partida leva as cartas que possui; o que você manifestou de outro é exilado se você sair (motor/sba.ts)',
  },
});
