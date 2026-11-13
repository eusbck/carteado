// Prosperous Thief
// Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Whenever one or more Ninja or Rogue creatures you control deal combat damage to a player, create a Treasure token.
import { createTokens, defineCard, lkiChars, ninjutsu, on, triggered } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Prosperous Thief',
  faces: [{
    abilities: [
      ninjutsu('{1}{U}'),
      // CR 603.2c: "um ou mais" dispara uma vez por lote; uma vez para cada jogador atingido
      triggered(on.batch((evs, c) => {
        const jogadores = new Set<PlayerId>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player' || e.controller !== c.you) continue;
          const ch = lkiChars(c.g, e.source);
          if (ch?.types.includes('Creature') && (ch.subtypes.includes('Ninja') || ch.subtypes.includes('Rogue'))) jogadores.add(e.target.id as PlayerId);
        }
        return jogadores.size ? [...jogadores].map((player) => ({ player })) : false;
      }), function* (c) {
        yield* createTokens(c.g, c.you, 'Treasure', 1);
      }, { text: 'Sempre que uma ou mais criaturas Ninja ou Rogue que você controla causam dano de combate a um jogador, crie uma ficha Treasure.' }),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: NINJUTSU.mesmoJogador,
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
    7: 'não se aplica: piada da carta (sem regra)',
  },
});
