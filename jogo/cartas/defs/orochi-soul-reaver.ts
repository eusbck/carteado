// Orochi Soul-Reaver
// Ninjutsu {3}{B} ({3}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your
// hand tapped and attacking.)
// Whenever one or more creatures you control deal combat damage to a player, create a Treasure token and manifest the
// top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time
// for its mana cost if it's a creature card.)
import { createTokens, defineCard, isCreature, ninjutsu, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';
import { manifestaTopoDe } from '../roubo.ts';

export default defineCard({
  name: 'Orochi Soul-Reaver',
  faces: [{
    abilities: [
      ninjutsu('{3}{B}'),
      // um gatilho por jogador que tomou dano de combate de criaturas suas no mesmo lote
      triggered(seusCausamDanoDeCombate((c, id) => isCreature(c.g, id)), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
        yield* manifestaTopoDe(c, c.event.jogador as PlayerId);
      }, { text: 'Sempre que uma ou mais criaturas que você controla causam dano de combate a um jogador, crie uma ficha de Treasure e manifeste a carta do topo do grimório desse jogador.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.49a — o ninjutsu só existe depois de declarados os bloqueadores (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    2: 'regra geral: CR 702.49a-b — revela a carta e devolve o atacante ao ativar (motor/conjurar-alternativo.ts ninjutsu)',
    3: 'regra geral: CR 702.49c — entra atacando o mesmo jogador que o devolvido (cartas/defs/fallen-shinobi.test.ts)',
    4: 'regra geral: CR 702.49c, 508.4 — não foi declarada atacante (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    5: 'regra geral: CR 702.49a — ativável nas etapas de declarar bloqueadores, dano e fim de combate (motor/conjurar-alternativo.ts)',
    6: 'regra geral: CR 510.4 — com primeiro golpe, o ninja que entra depois do primeiro dano causa dano na etapa normal (motor/combat.ts)',
    7: 'teste: cria um Treasure e manifesta o topo do jogador atingido; só você vê a carta manifestada',
  },
});
