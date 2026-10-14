// Fallen Shinobi
// Ninjutsu {2}{U}{B} ({2}{U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield
// from your hand tapped and attacking.)
// Whenever this creature deals combat damage to a player, that player exiles the top two cards of their library. Until
// end of turn, you may play those cards without paying their mana costs.
import { allowPlay, defineCard, exile, ninjutsu, on, triggered } from '../../motor/api.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';
import { ROUBO } from '../roubo.ts';

export default defineCard({
  name: 'Fallen Shinobi',
  faces: [{
    abilities: [
      ninjutsu('{2}{U}{B}'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const g = c.g;
        const p = c.event.player as PlayerId;
        if (g.state.players[p].left) return;
        const topo = g.state.zones.library[p].slice(0, 2);
        if (!topo.length) return;
        const exiladas = (yield* exile(g, topo)).filter((id): id is ObjId => id !== null && id !== undefined && g.state.objects[id]?.zone === 'exile');
        // ruling 1: terreno, só com a jogada de terreno do turno; mágica, no tempo normal dela
        allowPlay(g, c.you, c.source, exiladas, { kind: 'endOfTurn' }, { free: true });
      }, { text: 'Sempre que esta criatura causa dano de combate a um jogador, esse jogador exila as duas cartas do topo do grimório dele. Até o fim do turno, você pode jogar essas cartas sem pagar os custos de mana delas.' }),
    ],
  }],
  rulings: {
    1: 'teste: conjura de graça uma das cartas exiladas no mesmo turno; a outra continua exilada no turno seguinte',
    2: ROUBO.sai,
    3: 'teste: conjura de graça uma das cartas exiladas no mesmo turno; a outra continua exilada no turno seguinte',
    4: 'regra geral: CR 702.49a — o ninjutsu só existe depois de declarados os bloqueadores (motor/conjurar-alternativo.ts; cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    5: 'regra geral: CR 702.49a-b — revela a carta e devolve o atacante ao ativar; se a carta sair da mão, não entra (motor/conjurar-alternativo.ts ninjutsu)',
    6: 'teste: entra pelo ninjutsu atacando o mesmo jogador',
    7: 'regra geral: CR 702.49c, 508.4 — não foi declarada atacante (cartas/defs/yuriko-the-tigers-shadow.test.ts)',
    8: 'regra geral: CR 702.49a — ativável nas etapas de declarar bloqueadores, dano e fim de combate (motor/conjurar-alternativo.ts)',
    9: 'regra geral: CR 510.4 — com primeiro golpe, o ninja que entra depois do primeiro dano causa dano na etapa normal (motor/combat.ts)',
  },
});
