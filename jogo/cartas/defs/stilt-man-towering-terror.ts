// Stilt-Man, Towering Terror
// Reach
// Whenever one or more Villains you control deal combat damage to a player, gain control of target noncreature, nonland
// permanent that player controls until the end of your next turn. It gains "This permanent can't be sacrificed" until the
// end of your next turn.
import { addEffect, and, controllerOf, defineCard, gainControl, is, isSubtype, keyword, not, on, t, tgt, triggered } from '../../motor/api.ts';
import type { Duration, PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Stilt-Man, Towering Terror',
  faces: [{
    abilities: [
      keyword('reach'),
      // um gatilho por jogador que tomou dano de combate dos seus Villains no mesmo lote
      triggered(on.batch((evs, c) => {
        const jogadores = new Set<number>();
        for (const e of evs) {
          if (e.type !== 'damage' || !e.combat || e.target.kind !== 'player') continue;
          const o = c.g.state.objects[e.source];
          if (o && o.zone === 'battlefield' && controllerOf(c.g, e.source) === c.you && isSubtype(c.g, e.source, 'Villain')) jogadores.add(e.target.id);
        }
        return [...jogadores].map((jogador) => ({ jogador }));
      }), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        const duracao: Duration = { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number };
        gainControl(c.g, id, c.you, duracao, c.source);
        // "este permanente não pode ser sacrificado" (motor/actions.ts sacrifice)
        addEffect(c.g, { source: c.source, sourceDef: '', controller: c.you, duration: duracao, affected: [id], mods: [{ k: 'rule', id: 'rule:cantBeSacrificed' }] });
      }, {
        targets: [t.permanent(and(not(is.creature), not(is.land), (c, id) => controllerOf(c.g, id) === (c.event?.jogador as PlayerId | undefined)), 'permanente alvo que não é criatura nem terreno que esse jogador controla')],
        text: 'Sempre que um ou mais Villains que você controla causam dano de combate a um jogador, ganhe o controle do permanente alvo que não é criatura nem terreno que esse jogador controla até o fim do seu próximo turno. Ele ganha "Este permanente não pode ser sacrificado" até o fim do seu próximo turno.',
      }),
    ],
  }],
  rulings: {},
});
